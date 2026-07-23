import 'dart:convert';

import 'api.dart';
import 'local_database.dart';

class RecoveryResult {
  const RecoveryResult({
    required this.inspected,
    required this.resolved,
    required this.remaining,
  });
  final int inspected, resolved, remaining;
}

/// Resolves persisted financial ambiguity through authoritative lookups only.
/// It never creates or retries a payment.
class RecoveryCoordinator {
  RecoveryCoordinator({required this.api, required this.database});
  final PosApi api;
  final PosLocalDatabase database;

  Future<RecoveryResult> recoverPayments() async {
    final pending = database.pendingPaymentRecoveries();
    var resolved = 0;
    for (final row in pending) {
      final payload = jsonDecode(row['payload']! as String);
      if (payload is! Map) continue;
      final organizationId = payload['organizationId']?.toString();
      final saleId = row['sale_id']?.toString();
      final attemptId = row['id']?.toString();
      if (organizationId == null || saleId == null || attemptId == null) {
        continue;
      }
      final byKey = payload['lookupByKey'] == true;
      final outcome = byKey
          ? await api.paymentOutcomeByKey(
              organizationId,
              saleId,
              row['idempotency_key']!.toString(),
            )
          : await api.paymentOutcome(organizationId, saleId, attemptId);
      final status = outcome['status']?.toString() ?? 'unknown';
      if ({'approved', 'APPROVED', 'CAPTURED'}.contains(status)) {
        final snapshot = await api.sale(organizationId, saleId);
        final sale = snapshot['sale'] is Map
            ? Map<String, dynamic>.from(snapshot['sale'] as Map)
            : snapshot;
        if (sale['status']?.toString() != 'COMPLETED') {
          final version = int.tryParse(sale['version']?.toString() ?? '');
          final completeKey = payload['completeKey']?.toString();
          if (version != null && completeKey != null) {
            await api.complete(organizationId, saleId, version, completeKey);
          }
        }
        final receiptKey = payload['receiptKey']?.toString();
        if (receiptKey != null) {
          final receipt = await api.receipt(organizationId, saleId, receiptKey);
          final receiptId =
              receipt['id']?.toString() ?? receipt['receiptId']?.toString();
          if (receiptId != null) {
            database.saveReceipt(
              id: receiptId,
              saleId: saleId,
              payload: Map<String, Object?>.from(receipt),
            );
          }
        }
      }
      database.savePaymentRecovery(
        id: attemptId,
        saleId: saleId,
        idempotencyKey: row['idempotency_key']!.toString(),
        status: status,
        payload: {
          ...Map<String, Object?>.from(outcome),
          'organizationId': organizationId,
        },
      );
      if (!{
        'unknown',
        'processing',
        'UNKNOWN',
        'PROCESSING',
      }.contains(status)) {
        resolved++;
      }
    }
    return RecoveryResult(
      inspected: pending.length,
      resolved: resolved,
      remaining: database.pendingRecoveryCount,
    );
  }
}
