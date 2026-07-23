import 'package:flutter_test/flutter_test.dart';
import 'package:nexo_pos/app/bootstrap.dart';
import 'package:nexo_pos/app/pos_controller.dart';
import 'package:nexo_pos/core/models.dart';
import 'package:nexo_pos/core/offline.dart';
import 'package:nexo_pos/core/printing.dart';
import 'package:nexo_pos/core/local_database.dart';
import 'package:nexo_pos/core/recovery.dart';
import 'package:nexo_pos/core/security.dart';
import 'package:nexo_pos/testing/fake_pos_api.dart';

PosCart cart() => PosCart(
  localId: 'local-1',
  organizationId: 'organization-fixture',
  branchId: 'branch-fixture',
  deviceId: 'device-fixture',
  userId: 'user-fixture',
  idempotencySeed: 'stable-seed',
);

void main() {
  group('financial safety', () {
    test('money uses exact minor units', () {
      expect((const Money(101) + const Money(209)).minor, 310);
      expect(const Money(125).times(3).minor, 375);
      expect(
        () => const Money(1) + const Money(1, currency: 'USD'),
        throwsArgumentError,
      );
    });

    test('idempotency keys are stable and operation-scoped', () {
      final first = stableIdempotencyKey('sale-1', 'complete');
      expect(first, stableIdempotencyKey('sale-1', 'complete'));
      expect(first, isNot(stableIdempotencyKey('sale-1', 'payment')));
      expect(first.length, 64);
    });

    test('cart has explicit quantity validation', () {
      final value = cart();
      const product = PosProduct(
        id: 'p',
        variantId: 'v',
        name: 'Fixture',
        price: Money(1250),
      );
      value.add(product);
      value.add(product);
      expect(value.lines.single.quantity, 2);
      expect(value.total.minor, 2500);
      expect(() => value.setQuantity('v', -1), throwsA(isA<PosFailure>()));
    });
  });

  group('offline safety', () {
    test('financial operations are prohibited without a server contract', () {
      expect(OfflinePolicy.allowed(OfflineCapability.cachedCatalog), isTrue);
      expect(OfflinePolicy.allowed(OfflineCapability.cartDraft), isTrue);
      expect(OfflinePolicy.allowed(OfflineCapability.sale), isFalse);
      expect(OfflinePolicy.allowed(OfflineCapability.externalPayment), isFalse);
      expect(OfflinePolicy.allowed(OfflineCapability.refund), isFalse);
    });

    test('outbox preserves dependencies and deduplicates operation ids', () {
      final outbox = LocalOutbox();
      outbox.enqueue(
        OutboxEntry(
          id: 'create',
          operation: 'cart-draft',
          idempotencyKey: 'create-key',
          createdAt: DateTime.utc(2026),
        ),
      );
      outbox.enqueue(
        OutboxEntry(
          id: 'update',
          operation: 'cart-draft',
          idempotencyKey: 'update-key',
          createdAt: DateTime.utc(2026, 1, 2),
          dependsOn: 'create',
        ),
      );
      outbox.enqueue(
        OutboxEntry(
          id: 'duplicate',
          operation: 'duplicate',
          idempotencyKey: 'create-key',
          createdAt: DateTime.utc(2026, 1, 3),
        ),
      );
      expect(outbox.ready().map((operation) => operation.id), ['create']);
      outbox.acknowledge('create');
      expect(outbox.ready().map((operation) => operation.id), ['update']);
      expect(outbox.entries.length, 2);
    });
  });

  group('bootstrap guards', () {
    const base = PosBootstrapSnapshot(
      device: DeviceStatus.active,
      session: SessionStatus.authenticated,
      cash: CashSessionStatus.open,
      connectivity: ConnectivityState.online,
      organizationId: 'organization',
      branchId: 'branch',
    );

    test('requires enrollment before operational routing', () {
      expect(
        PosBootstrapPolicy.resolve(
          const PosBootstrapSnapshot(
            device: DeviceStatus.notEnrolled,
            session: SessionStatus.unauthenticated,
            cash: CashSessionStatus.none,
            connectivity: ConnectivityState.online,
          ),
        ),
        PosBootstrapRoute.enrollmentRequired,
      );
    });

    test('revocation has priority', () {
      expect(
        PosBootstrapPolicy.resolve(
          const PosBootstrapSnapshot(
            device: DeviceStatus.revoked,
            session: SessionStatus.authenticated,
            cash: CashSessionStatus.open,
            connectivity: ConnectivityState.online,
            organizationId: 'organization',
            branchId: 'branch',
          ),
        ),
        PosBootstrapRoute.deviceRevoked,
      );
    });

    test('valid context reaches operation', () {
      expect(PosBootstrapPolicy.resolve(base), PosBootstrapRoute.operational);
    });
  });

  group('checkout safety', () {
    test(
      'catalog expands contractual variants with exact minor units',
      () async {
        final controller = PosController(
          api: _NestedCatalogApi(),
          cart: cart(),
        );
        await controller.loadCatalog();
        expect(controller.catalog, hasLength(1));
        expect(controller.catalog.single.variantId, 'variant-real');
        expect(controller.catalog.single.price.minor, 11600);
        expect(controller.catalog.single.barcode, '750000000001');
      },
    );

    test('successful cash flow uses one authoritative sale', () async {
      final api = FakePosApi();
      final value = cart();
      value.add(
        const PosProduct(
          id: 'p',
          variantId: 'v',
          name: 'Fixture',
          price: Money(4500),
        ),
      );
      final controller = PosController(api: api, cart: value)
        ..cash = CashSessionStatus.open;
      await controller.finalizeCash(const Money(5000));
      expect(controller.checkout, CheckoutStatus.completed);
      expect(controller.saleId, 'fixture-sale');
      expect(controller.receiptId, 'fixture-receipt');
    });

    test('unknown payment blocks dangerous retry', () async {
      final api = FakePosApi(unknownPayment: true);
      final value = cart();
      value.add(
        const PosProduct(
          id: 'p',
          variantId: 'v',
          name: 'Fixture',
          price: Money(4500),
        ),
      );
      final controller = PosController(api: api, cart: value)
        ..cash = CashSessionStatus.open;
      await controller.finalizeCash(const Money(4500));
      expect(controller.checkout, CheckoutStatus.unknownOutcome);
      expect(controller.failure?.retryAllowed, isFalse);
      expect(controller.failure?.kind, PosErrorKind.paymentUnknown);
    });

    test(
      'approved recovery restores the canonical receipt without charging again',
      () async {
        final api = FakePosApi(unknownPayment: true);
        final value = cart()
          ..add(
            const PosProduct(
              id: 'p',
              variantId: 'v',
              name: 'Fixture',
              price: Money(4500),
            ),
          );
        final controller = PosController(api: api, cart: value)
          ..cash = CashSessionStatus.open;
        await controller.finalizeCash(const Money(4500));
        expect(controller.checkout, CheckoutStatus.unknownOutcome);

        api.unknownPayment = false;
        await controller.recoverUnknown();

        expect(controller.checkout, CheckoutStatus.completed);
        expect(controller.receiptId, 'fixture-receipt');
        expect(controller.receiptSnapshot?['folio'], 'FIXTURE-0001');
        expect(api.lastPaymentBody, isNotNull);
      },
    );

    test(
      'crash after capture remains recoverable without a second charge',
      () async {
        final database = await PosLocalDatabase.open(path: ':memory:');
        addTearDown(database.close);
        final api = _CrashAfterCaptureApi();
        final value = cart()
          ..add(
            const PosProduct(
              id: 'p',
              variantId: 'v',
              name: 'Fixture',
              price: Money(4500),
            ),
          );
        final controller = PosController(
          api: api,
          cart: value,
          database: database,
        )..cash = CashSessionStatus.open;

        await controller.finalizeCash(const Money(4500));
        expect(controller.checkout, CheckoutStatus.failed);
        expect(api.paymentCalls, 1);
        expect(database.pendingRecoveryCount, 1);

        final recovered = await RecoveryCoordinator(
          api: api,
          database: database,
        ).recoverPayments();
        expect(recovered.resolved, 1);
        expect(recovered.remaining, 0);
        expect(api.paymentCalls, 1);
        expect(database.receiptsForSale('fixture-sale'), hasLength(1));
      },
    );

    test(
      'external tender requires explicit approval and stores no card data',
      () async {
        final api = FakePosApi();
        final value = cart()
          ..add(
            const PosProduct(
              id: 'p',
              variantId: 'v',
              name: 'Fixture',
              price: Money(4500),
            ),
          );
        final controller = PosController(api: api, cart: value)
          ..cash = CashSessionStatus.open;
        await expectLater(
          controller.finalizeExternal(
            method: 'CARD_EXTERNAL',
            reference: 'APROB-42',
            explicitlyConfirmed: false,
          ),
          throwsA(isA<PosFailure>()),
        );
        await controller.finalizeExternal(
          method: 'CARD_EXTERNAL',
          reference: 'APROB-42',
          explicitlyConfirmed: true,
        );
        expect(api.lastPaymentBody, {
          'method': 'CARD_EXTERNAL',
          'amountMinor': '4500',
          'providerReference': 'APROB-42',
        });
        expect(api.lastPaymentBody.toString(), isNot(contains('PAN')));
        expect(controller.checkout, CheckoutStatus.completed);
      },
    );

    test('receipt printing is independent from completed sale', () async {
      final api = FakePosApi();
      final printer = TestPrinterAdapter();
      final database = await PosLocalDatabase.open(path: ':memory:');
      addTearDown(database.close);
      final value = cart()
        ..add(
          const PosProduct(
            id: 'p',
            variantId: 'v',
            name: 'Fixture',
            price: Money(4500),
          ),
        );
      final controller = PosController(
        api: api,
        cart: value,
        printer: printer,
        database: database,
      )..cash = CashSessionStatus.open;
      await controller.finalizeCash(const Money(4500));
      final result = await controller.printReceipt();
      expect(result.successful, isTrue);
      expect(printer.printed, hasLength(1));
      expect(database.printJobs('fixture-receipt'), hasLength(1));
      expect(controller.checkout, CheckoutStatus.completed);
    });
  });

  test(
    'keyboard-wedge scan adds once and suppresses immediate duplicate',
    () async {
      final api = FakePosApi();
      final controller = PosController(api: api, cart: cart());
      await controller.loadCatalog();
      final barcode = controller.catalog.first.barcode!;
      final now = DateTime.utc(2026);
      expect(controller.scanBarcode(barcode, now: now), isTrue);
      expect(
        controller.scanBarcode(
          barcode,
          now: now.add(const Duration(milliseconds: 100)),
        ),
        isFalse,
      );
      expect(controller.cart.lines.single.quantity, 1);
      expect(
        controller.scanBarcode(
          barcode,
          now: now.add(const Duration(milliseconds: 700)),
        ),
        isTrue,
      );
      expect(controller.cart.lines.single.quantity, 2);
    },
  );

  test('redaction removes credential values', () {
    final sanitized = Redactor.message(
      'Authorization=secret password:abc token=xyz',
    );
    expect(sanitized, isNot(contains('secret')));
    expect(sanitized, isNot(contains('abc')));
    expect(sanitized, isNot(contains('xyz')));
  });
}

class _CrashAfterCaptureApi extends FakePosApi {
  var paymentCalls = 0;
  var completeCalls = 0;

  @override
  Future<Map<String, dynamic>> payment(
    String organizationId,
    String saleId,
    Map<String, dynamic> body,
    String idempotencyKey,
  ) async {
    paymentCalls++;
    return super.payment(organizationId, saleId, body, idempotencyKey);
  }

  @override
  Future<Map<String, dynamic>> complete(
    String organizationId,
    String saleId,
    int expected,
    String idempotencyKey,
  ) async {
    completeCalls++;
    if (completeCalls == 1) {
      throw const PosFailure(
        PosErrorKind.backendUnavailable,
        'Simulated process interruption after capture.',
      );
    }
    return super.complete(organizationId, saleId, expected, idempotencyKey);
  }
}

class _NestedCatalogApi extends FakePosApi {
  @override
  Future<List<Map<String, dynamic>>> products(
    String organizationId,
    String branchId,
  ) async => [
    {
      'id': 'product-real',
      'name': 'Producto contractual',
      'status': 'ACTIVE',
      'variants': [
        {'id': 'variant-real', 'name': 'Default', 'status': 'ACTIVE'},
      ],
      'prices': [
        {'variantId': 'variant-real', 'amount': '116.000000', 'active': true},
      ],
      'barcodes': [
        {
          'variantId': 'variant-real',
          'normalizedValue': '750000000001',
          'isPrimary': true,
        },
      ],
    },
  ];
}
