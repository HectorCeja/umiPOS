# Phase 0B — Device Trust Model

## Purpose

Device trust is a financial authorization boundary, not device metadata. UMI owns enrollment,
public keys, branch binding, revocation, policy, and audit. POS and KDS own non-exportable private
keys and secure platform storage. The incomplete NEXO shared-secret protocol must not be copied.

## Trust subjects and bindings

| Subject       | Permanent or session binding                                           | Authority |
| ------------- | ---------------------------------------------------------------------- | --------- |
| POS device    | Device ID, public key, business, branch, type, status, minimum version | UMI API   |
| KDS device    | Device ID, public key/certificate, business, branch, pairing status    | UMI API   |
| Operator      | User, membership, branch scope, device, active shift, token expiry     | UMI API   |
| Manager proof | Approver, exact command fingerprint, requester, expiry, one-use status | UMI API   |
| Offline shift | Device, branch, register, operator, policy/catalog/contract versions   | UMI API   |

## Enrollment

1. An authorized dashboard actor issues a single-purpose code with business, branch, device type,
   expiry, and audit correlation.
2. The client generates a non-exportable P-256 key in Android Keystore or Apple
   Keychain/Secure Enclave.
3. The code expires after ten minutes and is protected as a sensitive business flow.
4. Consumption registers the public key and permanent branch binding. It never delivers a reusable
   shared production secret.
5. Same enrollment command and fingerprint returns the same result. Lost response recovery queries
   or replays that command rather than creating competing credentials.
6. The device is not `ACTIVE` until server policy, entitlement, branch, device type, and client
   version all pass.

Forbidden:

- Direct Supabase credentials, table writes, or privileged RPC from a client.
- Enrollment offline, wildcard branch assignment, plaintext key export, or response-only secret
  recovery.
- A client-selected tenant or branch overriding the enrollment binding.

## Per-command proof

Every POS financial command signs a canonical payload containing:

- HTTP method;
- versioned route;
- canonical body hash;
- timestamp and nonce;
- device ID;
- persisted `clientCommandId`.

The server verifies signature, public key status, freshness, nonce uniqueness, contract version,
minimum app version, business/branch binding, entitlement, operator session, permission, optimistic
version, and idempotency fingerprint. A worker identity never substitutes for request proof.

## Operator and PIN rules

- PINs are Argon2id-hashed server-side, rate-limited, and never stored locally.
- Access tokens last 15 minutes. Renewal during an active shift still requires valid device proof
  and current membership, branch, entitlement, and device state.
- Fresh operator PIN proof lasts five minutes and is bound to the operator/device context.
- A manager second PIN issues a one-use approval bound to the exact command fingerprint and expires
  after two minutes.
- Self-approval is denied when policy requires segregation of duties.
- Logs, telemetry, audit displays, and Assistant context never contain PINs or reusable approval
  material.

## Rotation, replacement, and revocation

| Event                 | Required behavior                                                                    |
| --------------------- | ------------------------------------------------------------------------------------ |
| Routine rotation      | Register a new public key through an authenticated challenge; retire the old key.    |
| Lost response         | Recover the idempotent enrollment/rotation result; never redisclose a shared secret. |
| Device replacement    | Enroll the replacement and revoke the former device with actor, reason, and audit.   |
| Device revocation     | Fail the next online command closed; invalidate refresh and offline sync authority.  |
| Branch reassignment   | Explicit management workflow, no active shift, new binding/certificates, full audit. |
| User suspension       | Fail subsequent operator commands and refresh; preserve financial evidence.          |
| Entitlement removal   | Fail the next online command; preserve journal for controlled resolution.            |
| Minimum-version block | Preserve local journal and require a certified update before further commands.       |

Revoked or replaced devices do not reactivate. Recovery is a new authorized lifecycle, not a status
flip.

## Offline trust

An online shift opening pins a signed, expiring snapshot of:

- device, branch, register, operator, entitlement, app version, and shift;
- catalog, modifiers, prices, taxes, discounts, business-date, availability, and policy versions;
- offline transaction/value limits or explicit unlimited-risk acceptance;
- contract version and expiry;
- paired KDS identities and certificates.

Offline operation is an allowlist. Shift start/official close, redemption, integrated provider
commands, refunds, privileged cash movements, approval, permission changes, catalog changes, and
enrollment remain online-only.

Local data is SQLCipher-encrypted with a non-exportable platform key. Commands are durably persisted
before tender or network interaction. PINs, tokens, authorization secrets, customer phone, PAN,
CVV, and raw provider payloads are not retained.

On reconnect, UMI revalidates device, operator, entitlement, snapshot, policy, contract, sequence,
and command fingerprint. Rejection is explicit; no silent loss or repricing is permitted.

## Threat and abuse controls

| Threat                   | Required control                                                       |
| ------------------------ | ---------------------------------------------------------------------- |
| Stolen enrollment code   | Short expiry, one purpose, rate limit, actor/branch binding, audit     |
| Replay                   | Timestamp, nonce, command identity, canonical body hash                |
| Forged context           | Server-owned business/branch binding and RLS context                   |
| Cloned local storage     | Non-exportable key plus encrypted database                             |
| Downgraded client        | Signed release and minimum-version policy                              |
| Brute-force PIN          | Argon2id, account/device/IP controls, lockout, redacted telemetry      |
| Approval replay          | Exact fingerprint, one use, two-minute expiry, segregation             |
| Cross-branch KDS traffic | Branch certificates, mutual TLS, signed envelope, receiver validation  |
| Lost command response    | Idempotent query/replay using original command                         |
| Privileged worker bypass | Same explicit authorization context; worker cannot impersonate request |

This maps directly to OWASP Top 10:2025 broken access control, authentication, cryptographic,
insecure-design, logging, and exceptional-condition risks, and API Security Top 10:2023 object,
authentication, function, resource-consumption, and sensitive-flow risks.

## Assistant boundary

Umi Assistant may:

- explain enrollment status, branch binding, minimum version, session expiry, or revocation;
- guide approved enrollment, rotation, replacement, update, and offline recovery workflows;
- present redacted proof diagnostics and runbooks.

It may not:

- generate or receive a PIN, private key, device proof, enrollment code, or approval token;
- activate/reassign/revoke a device without normal permission and human confirmation;
- bypass branch binding, RLS, lockout, minimum version, or offline capability rules;
- turn diagnostic access into a raw device or session mutation interface.

## Evidence and reimplementation note

Sources: `docs/flutter/FLUTTER_DEVICE_ENROLLMENT.md`,
`docs/architecture-transition/PHASE_0A_INVARIANT_CATALOG.md`, device-related tests and migrations
listed in the 0B-1 candidate manifest, and the authoritative fusion plan §§3.3, 4.4, and 4.5.
Only requirements and test vectors survive.
