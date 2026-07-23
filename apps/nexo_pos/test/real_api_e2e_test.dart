import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:nexo_pos/app/bootstrap.dart';
import 'package:nexo_pos/app/pos_controller.dart';
import 'package:nexo_pos/app/productive_coordinator.dart';
import 'package:nexo_pos/core/api.dart';
import 'package:nexo_pos/core/local_database.dart';
import 'package:nexo_pos/core/models.dart';
import 'package:nexo_pos/core/security.dart';
import 'package:nexo_pos/core/recovery.dart';

const _enabled = bool.fromEnvironment('NEXO_REAL_E2E');
const _organization = '10000000-0000-4000-8000-000000000001';
const _branch = '20000000-0000-4000-8000-000000000001';
const _password = 'Nexo Test Persona 2026!';

Map<String, String> _cookies(String? header) {
  final values = <String, String>{};
  if (header == null) return values;
  final pattern = RegExp(
    r'(?:^|,\s*)((?:__Host-)?nexo_(?:session|refresh|csrf))=([^;,\s]*)',
  );
  for (final match in pattern.allMatches(header)) {
    values[match.group(1)!] = match.group(2)!;
  }
  return values;
}

String _cookieHeader(Map<String, String> cookies) =>
    cookies.entries.map((entry) => '${entry.key}=${entry.value}').join('; ');

void main() {
  test(
    'productive Flutter client enrolls, restores, refreshes and blocks a revoked device',
    () async {
      Future<T> step<T>(String name, Future<T> Function() operation) async {
        try {
          return await operation();
        } on PosFailure catch (error) {
          fail(
            '$name: ${error.safeMessage} (${error.kind.name}, ${error.reference ?? 'sin referencia'})',
          );
        }
      }

      final base = Uri.parse('http://127.0.0.1:3001/');
      final admin = http.Client();
      addTearDown(admin.close);
      final stamp = DateTime.now().microsecondsSinceEpoch.toString();
      final login = await admin.post(
        base.resolve('/v1/auth/login'),
        headers: {'content-type': 'application/json'},
        body: jsonEncode({
          'email': 'alpha.owner@nexo.local',
          'password': _password,
          'deviceFingerprint': 'flutter-admin-$stamp',
          'deviceName': 'Flutter productive E2E',
        }),
      );
      expect(login.statusCode, 200, reason: login.body);
      final adminCookies = _cookies(login.headers['set-cookie']);
      final csrf =
          adminCookies['nexo_csrf'] ?? adminCookies['__Host-nexo_csrf'];
      expect(csrf, isNotNull);
      final invitation = await admin.post(
        base.resolve('/v1/organizations/$_organization/device-enrollments'),
        headers: {
          'content-type': 'application/json',
          'cookie': _cookieHeader(adminCookies),
          'x-csrf-token': csrf!,
        },
        body: jsonEncode({
          'branchId': _branch,
          'idempotencyKey': 'flutter-invite-$stamp',
          'capabilities': {'keyboard': true, 'scanner': true},
        }),
      );
      expect(invitation.statusCode, 201, reason: invitation.body);
      final token =
          (jsonDecode(invitation.body) as Map<String, dynamic>)['token']
              .toString();

      Map<String, String> adminWriteHeaders() => {
        'content-type': 'application/json',
        'cookie': _cookieHeader(adminCookies),
        'x-csrf-token': csrf,
      };
      final productResponse = await admin.post(
        base.resolve('/v1/organizations/$_organization/products'),
        headers: adminWriteHeaders(),
        body: jsonEncode({
          'name': 'Flutter Productive E2E',
          'sku': 'FLUTTER-$stamp',
          'type': 'SERVICE',
        }),
      );
      expect(productResponse.statusCode, 201, reason: productResponse.body);
      final productId =
          (jsonDecode(productResponse.body) as Map<String, dynamic>)['id']
              .toString();
      final productDetail = await admin.get(
        base.resolve('/v1/organizations/$_organization/products/$productId'),
        headers: {'cookie': _cookieHeader(adminCookies)},
      );
      expect(productDetail.statusCode, 200, reason: productDetail.body);
      final product = jsonDecode(productDetail.body) as Map<String, dynamic>;
      final variantId = ((product['variants'] as List).first as Map)['id']
          .toString();
      final price = await admin.post(
        base.resolve(
          '/v1/organizations/$_organization/products/$productId/prices',
        ),
        headers: adminWriteHeaders(),
        body: jsonEncode({
          'variantId': variantId,
          'amount': '50.00',
          'currency': 'MXN',
          'taxProfileKey': 'MX_STANDARD',
        }),
      );
      expect(price.statusCode, 201, reason: price.body);
      final activate = await admin.post(
        base.resolve(
          '/v1/organizations/$_organization/products/$productId/activate',
        ),
        headers: adminWriteHeaders(),
        body: jsonEncode({'version': product['version']}),
      );
      expect(activate.statusCode, 201, reason: activate.body);

      final store = MemorySecureStore();
      final environment = PosEnvironment(
        name: 'e2e',
        baseUri: base,
        production: false,
      );
      final client = OpenApiPosClient(environment, secureStore: store);
      final enrolled = await step(
        'enroll',
        () => client.enrollDevice(_organization, {
          'token': token,
          'name': 'Flutter terminal E2E',
          'platform': 'linux',
          'appVersion': '0.4.0',
          'fingerprintHash': stableIdempotencyKey(stamp, 'fingerprint'),
          'idempotencyKey': 'flutter-consume-$stamp',
          'capabilities': {'keyboard': true, 'scanner': true},
        }),
      );
      // Step assertions keep failures attributable without logging credentials.
      expect(await store.read('device.credential'), isNotEmpty);
      final device = (enrolled['device'] as Map).cast<String, dynamic>();
      expect(device['status'], 'ACTIVE');
      await step(
        'login',
        () => client.login(
          email: 'alpha.owner@nexo.local',
          password: _password,
          fingerprint: stableIdempotencyKey(stamp, 'login'),
          deviceName: 'Flutter terminal E2E',
        ),
      );
      final persistedCookies =
          jsonDecode((await store.read('session.cookies'))!)
              as Map<String, dynamic>;
      expect(
        persistedCookies.keys,
        contains(anyOf('nexo_csrf', '__Host-nexo_csrf')),
      );
      expect(
        persistedCookies.keys,
        contains(anyOf('nexo_refresh', '__Host-nexo_refresh')),
      );
      expect(
        (await step('identity', client.identity))['email'],
        'alpha.owner@nexo.local',
      );
      expect(
        await step('branches', () => client.branches(_organization)),
        isNotEmpty,
      );
      expect(
        await step(
          'permission',
          () => client.evaluatePermission(
            _organization,
            'sales.create',
            branchId: _branch,
          ),
        ),
        isTrue,
      );

      final restored = OpenApiPosClient(environment, secureStore: store);
      expect(
        (await step('restore identity', restored.identity))['email'],
        'alpha.owner@nexo.local',
      );
      await step('refresh', restored.refreshSession);

      final database = await PosLocalDatabase.open(path: ':memory:');
      final coordinator = ProductivePosCoordinator(
        api: restored,
        secureStore: store,
        database: database,
      );
      await step('productive bootstrap', coordinator.bootstrap);
      if (coordinator.route == PosBootstrapRoute.branchRequired) {
        await step(
          'select certification branch',
          () => coordinator.selectBranch(_branch),
        );
      }
      expect(
        coordinator.route,
        anyOf(
          PosBootstrapRoute.cashSessionRequired,
          PosBootstrapRoute.operational,
        ),
      );
      if (coordinator.route == PosBootstrapRoute.cashSessionRequired) {
        expect(coordinator.availableRegisters, isNotEmpty);
        await step(
          'cash open',
          () => coordinator.openCash(
            registerId: coordinator.availableRegisters.first['id'].toString(),
            opening: const Money(10000),
          ),
        );
        expect(
          coordinator.failure,
          isNull,
          reason:
              '${coordinator.failure?.safeMessage} (${coordinator.failure?.reference})',
        );
      }
      expect(coordinator.route, PosBootstrapRoute.operational);
      final pos = coordinator.operational!;
      await step('catalog', pos.loadCatalog);
      final sellable = pos.catalog.where(
        (product) => product.available && product.price.minor > 0,
      );
      expect(sellable, isNotEmpty);
      pos.cart.add(sellable.first);
      await step('cash checkout', () => pos.finalizeCash(const Money(10000)));
      expect(
        pos.failure,
        isNull,
        reason: '${pos.failure?.safeMessage} (${pos.failure?.reference})',
      );
      expect(pos.checkout, CheckoutStatus.completed);
      expect(pos.receiptSnapshot, isNotNull);
      expect((await pos.printReceipt()).successful, isTrue);
      expect(database.printJobs(pos.receiptId!), hasLength(1));

      final external = PosController(
        api: restored,
        database: database,
        cart: PosCart(
          localId: 'external-$stamp',
          organizationId: _organization,
          branchId: _branch,
          deviceId: device['id'].toString(),
          userId: coordinator.userId!,
          idempotencySeed: 'external-seed-$stamp',
        ),
      )..cash = CashSessionStatus.open;
      external.cart.add(sellable.first);
      await step(
        'external tender',
        () => external.finalizeExternal(
          method: 'CARD_EXTERNAL',
          reference: 'EXT-$stamp',
          explicitlyConfirmed: true,
        ),
      );
      expect(external.checkout, CheckoutStatus.completed);

      final lostResponse = PosController(
        api: _LoseFirstPaymentResponse(restored),
        database: database,
        cart: PosCart(
          localId: 'recovery-$stamp',
          organizationId: _organization,
          branchId: _branch,
          deviceId: device['id'].toString(),
          userId: coordinator.userId!,
          idempotencySeed: 'recovery-seed-$stamp',
        ),
      )..cash = CashSessionStatus.open;
      lostResponse.cart.add(sellable.first);
      await lostResponse.finalizeCash(const Money(10000));
      expect(lostResponse.checkout, CheckoutStatus.unknownOutcome);
      expect(database.pendingRecoveryCount, 1);
      final recovered = await RecoveryCoordinator(
        api: restored,
        database: database,
      ).recoverPayments();
      expect(recovered.resolved, 1);
      expect(recovered.remaining, 0);
      expect(
        (await restored.sale(
          _organization,
          lostResponse.saleId!,
        ))['sale']?['status'],
        'COMPLETED',
      );
      expect(database.receiptsForSale(lostResponse.saleId!), hasLength(1));

      Map<String, dynamic>? summary;
      for (var attempt = 0; attempt < 50; attempt++) {
        summary = await coordinator.refreshCashSummary();
        if (summary != null &&
            int.parse(summary['expectedAmountMinor'].toString()) == 21600) {
          break;
        }
        await Future<void>.delayed(const Duration(milliseconds: 100));
      }
      expect(
        summary?['expectedAmountMinor']?.toString(),
        '21600',
        reason: 'both captured cash sales must be posted before cash close',
      );
      await coordinator.countAndCloseCash(
        counted: Money(int.parse(summary!['expectedAmountMinor'].toString())),
      );
      expect(
        coordinator.failure,
        isNull,
        reason:
            '${coordinator.failure?.safeMessage} (${coordinator.failure?.reference})',
      );
      expect(coordinator.route, PosBootstrapRoute.cashSessionRequired);

      await step('logout', restored.logout);
      await expectLater(restored.identity(), throwsA(isA<PosFailure>()));

      final revoke = await admin.post(
        base.resolve(
          '/v1/organizations/$_organization/devices/${device['id']}/revoke',
        ),
        headers: {
          'content-type': 'application/json',
          'cookie': _cookieHeader(adminCookies),
          'x-csrf-token': csrf,
        },
        body: jsonEncode({'reason': 'Flutter E2E revocation'}),
      );
      expect(revoke.statusCode, 201, reason: revoke.body);
      await expectLater(
        client.currentDevice(_organization),
        throwsA(
          isA<PosFailure>().having(
            (error) => error.kind,
            'kind',
            PosErrorKind.deviceRevoked,
          ),
        ),
      );
      coordinator.dispose();
    },
    skip: _enabled ? false : 'requires the real Docker API',
  );
}

class _LoseFirstPaymentResponse implements PosApi {
  _LoseFirstPaymentResponse(this.delegate);
  final PosApi delegate;
  bool lost = false;

  @override
  Future<Map<String, dynamic>> payment(
    String organizationId,
    String saleId,
    Map<String, dynamic> body,
    String idempotencyKey,
  ) async {
    final result = await delegate.payment(
      organizationId,
      saleId,
      body,
      idempotencyKey,
    );
    if (!lost) {
      lost = true;
      throw const PosFailure(
        PosErrorKind.backendUnavailable,
        'Respuesta perdida después del envío.',
      );
    }
    return result;
  }

  @override
  Future<Map<String, dynamic>> addItem(
    String o,
    String s,
    int v,
    Map<String, dynamic> b,
    String k,
  ) => delegate.addItem(o, s, v, b, k);
  @override
  Future<Map<String, dynamic>> checkout(String o, String s, int v, String k) =>
      delegate.checkout(o, s, v, k);
  @override
  Future<Map<String, dynamic>> complete(String o, String s, int v, String k) =>
      delegate.complete(o, s, v, k);
  @override
  Future<Map<String, dynamic>> createSale(
    String o,
    Map<String, dynamic> b,
    String k,
  ) => delegate.createSale(o, b, k);
  @override
  Future<Map<String, dynamic>> currentDevice(String o) =>
      delegate.currentDevice(o);
  @override
  Future<Map<String, dynamic>> enrollDevice(String o, Map<String, dynamic> b) =>
      delegate.enrollDevice(o, b);
  @override
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
    required String fingerprint,
    required String deviceName,
  }) => delegate.login(
    email: email,
    password: password,
    fingerprint: fingerprint,
    deviceName: deviceName,
  );
  @override
  Future<Map<String, dynamic>> paymentOutcome(String o, String s, String a) =>
      delegate.paymentOutcome(o, s, a);
  @override
  Future<Map<String, dynamic>> paymentOutcomeByKey(
    String o,
    String s,
    String k,
  ) => delegate.paymentOutcomeByKey(o, s, k);
  @override
  Future<List<Map<String, dynamic>>> products(String o, String b) =>
      delegate.products(o, b);
  @override
  Future<Map<String, dynamic>> receipt(String o, String s, String k) =>
      delegate.receipt(o, s, k);
  @override
  Future<Map<String, dynamic>> sale(String o, String s) => delegate.sale(o, s);
}
