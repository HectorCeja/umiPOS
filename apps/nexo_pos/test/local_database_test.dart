import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:nexo_pos/core/local_database.dart';
import 'package:nexo_pos/core/recovery.dart';
import 'package:nexo_pos/testing/fake_pos_api.dart';

void main() {
  test('local schema migrates and outbox preserves dependencies', () async {
    final database = await PosLocalDatabase.open(path: ':memory:');
    addTearDown(database.close);
    database.enqueue(
      id: 'sale',
      operationType: 'offlineSale',
      idempotencyKey: 'sale-key-0001',
      payload: {'totalMinor': '1000'},
    );
    database.enqueue(
      id: 'receipt',
      operationType: 'receipt',
      idempotencyKey: 'receipt-key-0001',
      payload: {'provisional': true},
      dependsOn: 'sale',
    );
    expect(database.ready().map((row) => row['id']), ['sale']);
    database.transition('sale', LocalOperationState.acknowledged);
    expect(database.ready().map((row) => row['id']), ['receipt']);
  });

  test('payment recovery upserts the same stable attempt', () async {
    final database = await PosLocalDatabase.open(path: ':memory:');
    addTearDown(database.close);
    database.savePaymentRecovery(
      id: 'attempt',
      saleId: 'sale',
      idempotencyKey: 'payment-key-0001',
      status: 'unknown',
      payload: {'safe': true},
    );
    database.savePaymentRecovery(
      id: 'attempt',
      saleId: 'sale',
      idempotencyKey: 'payment-key-0001',
      status: 'approved',
      payload: {'safe': true},
    );
    expect(database.pendingRecoveryCount, 0);
  });

  test('official receipt cache is stable and readable offline', () async {
    final database = await PosLocalDatabase.open(path: ':memory:');
    addTearDown(database.close);
    database.saveReceipt(
      id: 'receipt-1',
      saleId: 'sale-1',
      payload: {'folio': 'NEXO-1', 'totalMinor': '4500'},
    );
    expect(database.receipt('receipt-1')?['official'], 1);
    expect(database.userVersion, PosLocalDatabase.schemaVersion);
  });

  test(
    'device restart reopens the durable financial recovery checkpoint',
    () async {
      final directory = await Directory.systemTemp.createTemp(
        'nexo-pos-recovery-',
      );
      addTearDown(() => directory.delete(recursive: true));
      final path = '${directory.path}${Platform.pathSeparator}pos.sqlite3';
      final first = await PosLocalDatabase.open(path: path);
      first.savePaymentRecovery(
        id: 'pending-payment',
        saleId: 'sale-after-restart',
        idempotencyKey: 'stable-payment-key',
        status: 'processing',
        payload: {'organizationId': 'organization-1', 'lookupByKey': true},
      );
      first.close();

      final restarted = await PosLocalDatabase.open(path: path);
      addTearDown(restarted.close);
      expect(restarted.pendingRecoveryCount, 1);
      expect(
        restarted.pendingPaymentRecoveries().single['idempotency_key'],
        'stable-payment-key',
      );
    },
  );

  test(
    'reprint attempts remain auditable without changing the receipt',
    () async {
      final database = await PosLocalDatabase.open(path: ':memory:');
      addTearDown(database.close);
      database.saveReceipt(
        id: 'receipt-1',
        saleId: 'sale-1',
        payload: {'folio': 'NEXO-1'},
      );
      database.recordPrintJob(
        receiptId: 'receipt-1',
        status: 'printed',
        adapter: 'NEXO Test Printer',
      );
      expect(database.printJobs('receipt-1'), hasLength(1));
      expect(database.receipt('receipt-1')?['official'], 1);
    },
  );

  test(
    'recovery coordinator only queries and resolves persisted attempt',
    () async {
      final database = await PosLocalDatabase.open(path: ':memory:');
      addTearDown(database.close);
      database.savePaymentRecovery(
        id: 'attempt-1',
        saleId: 'sale-1',
        idempotencyKey: 'payment-key-0001',
        status: 'unknown',
        payload: {'organizationId': 'organization-1'},
      );
      final result = await RecoveryCoordinator(
        api: FakePosApi(),
        database: database,
      ).recoverPayments();
      expect(result.inspected, 1);
      expect(result.resolved, 1);
      expect(result.remaining, 0);
    },
  );
}
