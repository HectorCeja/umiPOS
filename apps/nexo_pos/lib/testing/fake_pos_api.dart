import '../core/api.dart';
import '../core/models.dart';

/// Visual/integration fixture only. Never selected by production bootstrap.
class FakePosApi implements PosApi {
  FakePosApi({this.unknownPayment = false});
  bool unknownPayment;
  int version = 0;
  Map<String, dynamic>? lastPaymentBody;
  String? lastPaymentKey;
  @override
  Future<Map<String, dynamic>> enrollDevice(
    String organizationId,
    Map<String, dynamic> body,
  ) async => {
    'device': {
      'id': 'fixture-device',
      'organizationId': organizationId,
      'status': 'ACTIVE',
    },
    'credential': 'fixture-only-credential',
  };
  @override
  Future<Map<String, dynamic>> currentDevice(String organizationId) async => {
    'id': 'fixture-device',
    'organizationId': organizationId,
    'status': 'ACTIVE',
  };
  @override
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
    required String fingerprint,
    required String deviceName,
  }) async => {};
  @override
  Future<List<Map<String, dynamic>>> products(
    String organizationId,
    String branchId,
  ) async => List.generate(
    24,
    (i) => {
      'id': 'product-$i',
      'variantId': 'variant-$i',
      'name': [
        'Café de origen',
        'Pan artesanal',
        'Té frío',
        'Postre de cacao',
      ][i % 4],
      'priceMinor': '${4500 + i * 125}',
      'barcode': '750000${i.toString().padLeft(6, '0')}',
    },
  );
  @override
  Future<Map<String, dynamic>> createSale(
    String organizationId,
    Map<String, dynamic> body,
    String idempotencyKey,
  ) async => {'id': 'fixture-sale', 'version': version};
  @override
  Future<Map<String, dynamic>> addItem(
    String organizationId,
    String saleId,
    int expected,
    Map<String, dynamic> body,
    String idempotencyKey,
  ) async => {'saleVersion': ++version};
  @override
  Future<Map<String, dynamic>> checkout(
    String organizationId,
    String saleId,
    int expected,
    String idempotencyKey,
  ) async => {'version': version, 'totalMinor': '4500'};
  @override
  Future<Map<String, dynamic>> payment(
    String organizationId,
    String saleId,
    Map<String, dynamic> body,
    String idempotencyKey,
  ) async {
    lastPaymentBody = Map<String, dynamic>.from(body);
    lastPaymentKey = idempotencyKey;
    if (unknownPayment) {
      throw const PosFailure(PosErrorKind.timeout, 'Tiempo de espera agotado.');
    }
    return {'status': 'CAPTURED', 'id': 'fixture-attempt'};
  }

  @override
  Future<Map<String, dynamic>> complete(
    String organizationId,
    String saleId,
    int expected,
    String idempotencyKey,
  ) async => {'status': 'COMPLETED', 'receiptId': 'fixture-receipt'};
  @override
  Future<Map<String, dynamic>> sale(
    String organizationId,
    String saleId,
  ) async => {'status': 'COMPLETED', 'receiptId': 'fixture-receipt'};
  @override
  Future<Map<String, dynamic>> paymentOutcome(
    String organizationId,
    String saleId,
    String paymentAttemptId,
  ) async => {
    'paymentAttemptId': paymentAttemptId,
    'saleId': saleId,
    'status': unknownPayment ? 'unknown' : 'approved',
    'retryGuidance': unknownPayment ? 'QUERY_ONLY_DO_NOT_RECREATE' : 'TERMINAL',
  };
  @override
  Future<Map<String, dynamic>> paymentOutcomeByKey(
    String organizationId,
    String saleId,
    String idempotencyKey,
  ) async => paymentOutcome(organizationId, saleId, 'fixture-attempt');
  @override
  Future<Map<String, dynamic>> receipt(
    String organizationId,
    String saleId,
    String idempotencyKey,
  ) async => {
    'id': 'fixture-receipt',
    'saleId': saleId,
    'folio': 'FIXTURE-0001',
    'totalMinor': '4500',
    'currency': 'MXN',
  };
}
