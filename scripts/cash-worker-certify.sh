#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${root}"
tenant=10000000-0000-4000-8000-000000000001
branch=20000000-0000-4000-8000-000000000001
event_before="$(cat /proc/sys/kernel/random/uuid)"
event_after="$(cat /proc/sys/kernel/random/uuid)"
event_bad="$(cat /proc/sys/kernel/random/uuid)"
event_version="$(cat /proc/sys/kernel/random/uuid)"
event_healthy="$(cat /proc/sys/kernel/random/uuid)"
sale_bad="$(cat /proc/sys/kernel/random/uuid)"
correlation="$(cat /proc/sys/kernel/random/uuid)"

psql_admin() {
  docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U nexo_admin -d nexo "$@"
}

wait_sql() {
  local sql="$1" expected="$2"
  for attempt in $(seq 1 60); do
    [[ "$(psql_admin -Atc "${sql}")" = "${expected}" ]] && return 0
    sleep 1
  done
  echo "Timed out waiting for: ${sql} = ${expected}" >&2
  return 1
}

docker compose stop worker
psql_admin -c "INSERT INTO cash_outbox(tenant_id,organization_id,branch_id,id,event_type,event_version,payload,occurred_at) VALUES('${tenant}','${tenant}','${branch}','${event_before}','CashSessionOpened',1,jsonb_build_object('sessionId','${event_before}','currency','MXN'),now())"

claim_started="$(date +%s%N)"
set +e
docker compose run --rm \
  -e NEXO_WORKER_TEST_FAULT=cash-after-claim \
  -e NEXO_WORKER_TEST_EVENT_ID="${event_before}" worker
fault_status=$?
set -e
claim_ms="$(( ($(date +%s%N) - claim_started) / 1000000 ))"
[[ "${fault_status}" = 86 ]]
[[ "$(psql_admin -Atc "SELECT count(*) FROM cash_outbox WHERE id='${event_before}' AND claimed_by IS NOT NULL AND published_at IS NULL")" = 1 ]]
psql_admin -c "UPDATE cash_outbox SET claim_expires_at=now()-interval '1 second' WHERE id='${event_before}'"
lease_started="$(date +%s%N)"
docker compose up -d --scale worker=2 worker
wait_sql "SELECT count(*) FROM cash_outbox WHERE id='${event_before}' AND published_at IS NOT NULL" 1
lease_ms="$(( ($(date +%s%N) - lease_started) / 1000000 ))"
wait_sql "SELECT count(*) FROM cash_public_event_deliveries WHERE event_id='${event_before}'" 1

docker compose stop worker
psql_admin -c "INSERT INTO cash_outbox(tenant_id,organization_id,branch_id,id,event_type,event_version,payload,occurred_at) VALUES('${tenant}','${tenant}','${branch}','${event_after}','CashSessionOpened',1,jsonb_build_object('sessionId','${event_after}','currency','MXN'),now())"
publish_started="$(date +%s%N)"
set +e
docker compose run --rm \
  -e NEXO_WORKER_TEST_FAULT=cash-after-publish \
  -e NEXO_WORKER_TEST_EVENT_ID="${event_after}" worker
fault_status=$?
set -e
publish_ms="$(( ($(date +%s%N) - publish_started) / 1000000 ))"
[[ "${fault_status}" = 86 ]]
[[ "$(psql_admin -Atc "SELECT count(*) FROM cash_public_event_deliveries WHERE event_id='${event_after}'")" = 1 ]]
[[ "$(psql_admin -Atc "SELECT count(*) FROM cash_outbox WHERE id='${event_after}' AND published_at IS NULL")" = 1 ]]
psql_admin -c "UPDATE cash_outbox SET claim_expires_at=now()-interval '1 second' WHERE id='${event_after}'"
docker compose up -d --scale worker=2 worker
wait_sql "SELECT count(*) FROM cash_outbox WHERE id='${event_after}' AND published_at IS NOT NULL" 1
[[ "$(psql_admin -Atc "SELECT count(*) FROM cash_public_event_deliveries WHERE event_id='${event_after}'")" = 1 ]]

psql_admin <<SQL
INSERT INTO sales(tenant_id,id,organization_id,branch_id,seller_user_id,membership_id,currency,business_date,status,channel,source,idempotency_key,correlation_id,updated_at)
SELECT '${tenant}','${sale_bad}','${tenant}','${branch}','41000000-0000-4000-8000-000000000001',id,'MXN',current_date,'COMPLETED','API','CERTIFICATION','worker-bad-${sale_bad}','${correlation}',now()
FROM memberships WHERE tenant_id='${tenant}' AND principal_id='41000000-0000-4000-8000-000000000001' LIMIT 1;
INSERT INTO sales_outbox(tenant_id,id,aggregate_id,aggregate_version,event_type,event_version,correlation_id,payload,attempts,next_attempt_at,occurred_at)
VALUES('${tenant}','${event_bad}','${sale_bad}',1,'RefundApproved',1,'${correlation}',jsonb_build_object('refundIntentId','00000000-0000-4000-8000-000000000099'),0,now(),now());
SQL
wait_sql "SELECT count(*) FROM sales_outbox WHERE id='${event_bad}' AND attempts=1 AND quarantined_at IS NULL AND next_attempt_at>last_attempt_at" 1
psql_admin -c "UPDATE sales_outbox SET attempts=9,next_attempt_at=now() WHERE id='${event_bad}'"
wait_sql "SELECT count(*) FROM sales_outbox WHERE id='${event_bad}' AND quarantined_at IS NOT NULL AND attempts=10" 1

psql_admin -c "INSERT INTO sales_outbox(tenant_id,id,aggregate_id,aggregate_version,event_type,event_version,correlation_id,payload,attempts,next_attempt_at,occurred_at) VALUES('${tenant}','${event_version}','${sale_bad}',2,'RefundApproved',99,'${correlation}',jsonb_build_object('refundIntentId','00000000-0000-4000-8000-000000000099'),9,now(),now())"
wait_sql "SELECT count(*) FROM sales_outbox WHERE id='${event_version}' AND quarantined_at IS NOT NULL AND attempts=10 AND last_error LIKE '%CASH_REFUND_EVENT_VERSION_UNSUPPORTED%'" 1

wait_sql "SELECT count(*) FROM cash_outbox WHERE published_at IS NULL AND quarantined_at IS NULL" 0
wait_sql "SELECT count(*) FROM sales_outbox WHERE published_at IS NULL AND quarantined_at IS NULL" 0
psql_admin -c "INSERT INTO cash_outbox(tenant_id,organization_id,branch_id,id,event_type,event_version,payload,occurred_at) VALUES('${tenant}','${tenant}','${branch}','${event_healthy}','CashSessionOpened',1,jsonb_build_object('sessionId','${event_healthy}','currency','MXN'),clock_timestamp())"
wait_sql "SELECT count(*) FROM cash_outbox WHERE id='${event_healthy}' AND published_at IS NOT NULL" 1
claim_ms="$(psql_admin -Atc "SELECT round(extract(epoch FROM(first_attempt_at-occurred_at))*1000)::bigint FROM cash_outbox WHERE id='${event_healthy}'")"
publish_ms="$(psql_admin -Atc "SELECT round(extract(epoch FROM(published_at-occurred_at))*1000)::bigint FROM cash_outbox WHERE id='${event_healthy}'")"
mkdir -p artifacts/cash-certification/performance
printf '{"outboxClaim":[%s],"outboxPublish":[%s],"leaseRecovery":[%s]}\n' \
  "${claim_ms}" "${publish_ms}" "${lease_ms}" \
  > artifacts/cash-certification/performance/worker-results.json
echo "worker certification passed: claim crash, lease recovery, publish crash, idempotent replay, quarantine, two workers"
