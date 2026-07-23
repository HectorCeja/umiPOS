import 'dart:convert';
import 'package:http/http.dart' as http;
import 'models.dart';
import 'security.dart';

class PosEnvironment {
  const PosEnvironment({
    required this.name,
    required this.baseUri,
    required this.production,
    this.timeout = const Duration(seconds: 12),
  });
  final String name;
  final Uri baseUri;
  final bool production;
  final Duration timeout;
  void validate() {
    if (baseUri.scheme != 'https' && production) {
      throw const PosFailure(
        PosErrorKind.validation,
        'Producción requiere HTTPS.',
      );
    }
    if (production && {'localhost', '127.0.0.1'}.contains(baseUri.host)) {
      throw const PosFailure(
        PosErrorKind.validation,
        'Producción no puede usar localhost.',
      );
    }
  }
}

abstract interface class PosApi {
  Future<Map<String, dynamic>> enrollDevice(
    String organizationId,
    Map<String, dynamic> body,
  );
  Future<Map<String, dynamic>> currentDevice(String organizationId);
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
    required String fingerprint,
    required String deviceName,
  });
  Future<List<Map<String, dynamic>>> products(
    String organizationId,
    String branchId,
  );
  Future<Map<String, dynamic>> createSale(
    String organizationId,
    Map<String, dynamic> body,
    String idempotencyKey,
  );
  Future<Map<String, dynamic>> addItem(
    String organizationId,
    String saleId,
    int version,
    Map<String, dynamic> body,
    String idempotencyKey,
  );
  Future<Map<String, dynamic>> checkout(
    String organizationId,
    String saleId,
    int version,
    String idempotencyKey,
  );
  Future<Map<String, dynamic>> payment(
    String organizationId,
    String saleId,
    Map<String, dynamic> body,
    String idempotencyKey,
  );
  Future<Map<String, dynamic>> complete(
    String organizationId,
    String saleId,
    int version,
    String idempotencyKey,
  );
  Future<Map<String, dynamic>> sale(String organizationId, String saleId);
  Future<Map<String, dynamic>> paymentOutcome(
    String organizationId,
    String saleId,
    String paymentAttemptId,
  );
  Future<Map<String, dynamic>> paymentOutcomeByKey(
    String organizationId,
    String saleId,
    String idempotencyKey,
  );
  Future<Map<String, dynamic>> receipt(
    String organizationId,
    String saleId,
    String idempotencyKey,
  );
}

class OpenApiPosClient implements PosApi {
  OpenApiPosClient(this.environment, {http.Client? client, this._secureStore})
    : _client = client ?? http.Client() {
    environment.validate();
  }
  final PosEnvironment environment;
  final http.Client _client;
  final SecureStore? _secureStore;
  final Map<String, String> _cookies = {};
  String? _csrf;
  bool _hydrated = false;
  Future<Map<String, dynamic>> _request(
    String path, {
    String method = 'GET',
    Map<String, dynamic>? body,
    Map<String, String>? extraHeaders,
    String? idempotencyKey,
    int? expectedVersion,
  }) async {
    if (!_hydrated) {
      final persisted = await _secureStore?.read('session.cookies');
      if (persisted != null) {
        final decoded = jsonDecode(persisted);
        if (decoded is Map) {
          for (final entry in decoded.entries) {
            _cookies[entry.key.toString()] = entry.value.toString();
          }
        }
      }
      _csrf = _cookies['nexo_csrf'] ?? _cookies['__Host-nexo_csrf'];
      _hydrated = true;
    }
    final headers = <String, String>{
      'accept': 'application/json',
      'x-request-id': stableRequestId(path, idempotencyKey),
    };
    if (body != null) headers['content-type'] = 'application/json';
    final deviceCredential = await _secureStore?.read('device.credential');
    if (deviceCredential != null && deviceCredential.isNotEmpty) {
      headers['x-nexo-device-credential'] = deviceCredential;
    }
    if (extraHeaders != null) headers.addAll(extraHeaders);
    if (_cookies.isNotEmpty) {
      headers['cookie'] = _cookies.entries
          .map((entry) => '${entry.key}=${entry.value}')
          .join('; ');
    }
    if (_csrf != null && method != 'GET') headers['x-csrf-token'] = _csrf!;
    if (idempotencyKey != null) headers['idempotency-key'] = idempotencyKey;
    if (expectedVersion != null) {
      headers['if-match'] = expectedVersion.toString();
    }
    try {
      final request = http.Request(method, environment.baseUri.resolve(path))
        ..headers.addAll(headers);
      if (body != null) request.body = jsonEncode(body);
      final streamed = await _client.send(request).timeout(environment.timeout);
      final response = await http.Response.fromStream(streamed);
      final setCookie = response.headers['set-cookie'];
      if (setCookie != null) {
        final cookiePattern = RegExp(
          r'(?:^|,\s*)((?:__Host-)?nexo_(?:session|refresh|csrf))=([^;,\s]*)',
        );
        for (final match in cookiePattern.allMatches(setCookie)) {
          final name = match.group(1)!;
          final value = match.group(2)!;
          if (value.isEmpty) {
            _cookies.remove(name);
          } else {
            _cookies[name] = value;
          }
        }
        _csrf = _cookies['nexo_csrf'] ?? _cookies['__Host-nexo_csrf'];
        await _persistCookies();
      }
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw _map(response.statusCode, response.body);
      }
      if (response.body.isEmpty) return {};
      final decoded = jsonDecode(response.body);
      return decoded is Map<String, dynamic> ? decoded : {'items': decoded};
    } on PosFailure {
      rethrow;
    } catch (_) {
      throw const PosFailure(
        PosErrorKind.backendUnavailable,
        'No fue posible comunicarse con NEXO.',
        retryAllowed: true,
      );
    }
  }

  Future<void> _persistCookies() async {
    if (_cookies.isEmpty) {
      await _secureStore?.delete('session.cookies');
    } else {
      await _secureStore?.write('session.cookies', jsonEncode(_cookies));
    }
  }

  Future<Map<String, dynamic>> identity() => _request('/v1/identity');

  Future<Map<String, dynamic>> refreshSession() =>
      _request('/v1/auth/refresh', method: 'POST');

  Future<void> logout({bool global = false}) async {
    await _request(
      global ? '/v1/auth/logout-all' : '/v1/auth/logout',
      method: 'POST',
    );
    _cookies.clear();
    _csrf = null;
    await _persistCookies();
  }

  Future<List<Map<String, dynamic>>> branches(String organizationId) async {
    final result = await _request('/v1/organizations/$organizationId/branches');
    return _rows(result);
  }

  Future<Map<String, dynamic>> authorizationContext(
    String organizationId, {
    String? branchId,
  }) => _request(
    '/v1/organizations/$organizationId/authorization/context${branchId == null ? '' : '?branchId=${Uri.encodeQueryComponent(branchId)}'}',
  );

  Future<bool> evaluatePermission(
    String organizationId,
    String permission, {
    String? branchId,
    String resourceType = 'pos_operation',
  }) async {
    final result = await _request(
      '/v1/organizations/$organizationId/authorization/evaluate',
      method: 'POST',
      body: {
        'permission': permission,
        'resource': {'type': resourceType, 'branchId': ?branchId},
      },
    );
    return result['allowed'] == true;
  }

  Future<Map<String, dynamic>> activeCashSession(
    String organizationId,
    String branchId,
  ) => _request(
    '/v1/organizations/$organizationId/cash/sessions/active?branchId=${Uri.encodeQueryComponent(branchId)}',
  );

  Future<Map<String, dynamic>> cashSession(
    String organizationId,
    String sessionId,
  ) => _request('/v1/organizations/$organizationId/cash/sessions/$sessionId');

  Future<Map<String, dynamic>> cashSummary(
    String organizationId,
    String sessionId,
  ) => _request(
    '/v1/organizations/$organizationId/cash/sessions/$sessionId/summary',
  );

  Future<List<Map<String, dynamic>>> cashRegisters(
    String organizationId,
    String branchId,
  ) async => _rows(
    await _request(
      '/v1/organizations/$organizationId/cash/registers?branchId=${Uri.encodeQueryComponent(branchId)}',
    ),
  );

  Future<Map<String, dynamic>> openCashSession(
    String organizationId,
    Map<String, dynamic> body,
    String key,
  ) => _request(
    '/v1/organizations/$organizationId/cash/sessions/open',
    method: 'POST',
    body: body,
    idempotencyKey: key,
  );

  Future<Map<String, dynamic>> cashCommand(
    String organizationId,
    String sessionId,
    String operation,
    String key, {
    Map<String, dynamic>? body,
  }) => _request(
    '/v1/organizations/$organizationId/cash/sessions/$sessionId/$operation',
    method: 'POST',
    body: body,
    idempotencyKey: key,
  );

  Future<Map<String, dynamic>> generateReceipt(
    String organizationId,
    String saleId,
    String key,
  ) => _request(
    '/v1/organizations/$organizationId/sales/$saleId/receipt',
    method: 'POST',
    idempotencyKey: key,
  );

  @override
  Future<Map<String, dynamic>> receipt(
    String organizationId,
    String saleId,
    String idempotencyKey,
  ) => generateReceipt(organizationId, saleId, idempotencyKey);

  Future<Map<String, dynamic>> saleTransition(
    String organizationId,
    String saleId,
    String transition,
    String key, {
    int? expectedVersion,
    Map<String, dynamic>? body,
  }) => _request(
    '/v1/organizations/$organizationId/sales/$saleId/$transition',
    method: 'POST',
    body: body,
    idempotencyKey: key,
    expectedVersion: expectedVersion,
  );

  Future<List<Map<String, dynamic>>> sales(
    String organizationId, {
    String? branchId,
  }) async => _rows(
    await _request(
      '/v1/organizations/$organizationId/sales${branchId == null ? '' : '?branchId=${Uri.encodeQueryComponent(branchId)}'}',
    ),
  );

  Future<Map<String, dynamic>> salesAdmin(
    String organizationId,
    String resource,
  ) => _request(
    '/v1/organizations/$organizationId/sales-administration/$resource',
  );

  List<Map<String, dynamic>> _rows(Map<String, dynamic> value) =>
      ((value['items'] ?? value['data'] ?? const []) as List)
          .whereType<Map>()
          .map((row) => Map<String, dynamic>.from(row))
          .toList(growable: false);

  @override
  Future<Map<String, dynamic>> enrollDevice(
    String organizationId,
    Map<String, dynamic> body,
  ) async {
    final result = await _request(
      '/v1/organizations/$organizationId/device-enrollments/consume',
      method: 'POST',
      body: body,
    );
    final credential = result['credential']?.toString();
    if (credential == null || credential.isEmpty) {
      throw const PosFailure(
        PosErrorKind.unknown,
        'NEXO no devolvió la credencial del dispositivo.',
      );
    }
    await _secureStore?.write('device.organization', organizationId);
    await _secureStore?.write('device.credential', credential);
    return result;
  }

  @override
  Future<Map<String, dynamic>> currentDevice(String organizationId) async {
    final credential = await _secureStore?.read('device.credential');
    if (credential == null) {
      throw const PosFailure(
        PosErrorKind.deviceNotEnrolled,
        'El dispositivo no está enrolado.',
      );
    }
    return _request(
      '/v1/organizations/$organizationId/devices/current',
      extraHeaders: {'x-nexo-device-credential': credential},
    );
  }

  PosFailure _map(int status, String body) {
    final normalized = body.toLowerCase();
    if (status == 401 &&
        normalized.contains('device credential invalid or inactive')) {
      return const PosFailure(
        PosErrorKind.deviceRevoked,
        'La terminal fue revocada o deshabilitada.',
        retryAllowed: false,
      );
    }
    return switch (status) {
      401 => const PosFailure(PosErrorKind.sessionExpired, 'La sesión expiró.'),
      403 => const PosFailure(
        PosErrorKind.forbidden,
        'No tienes permiso para esta operación.',
      ),
      409 => PosFailure(
        PosErrorKind.conflict,
        'La operación cambió en el servidor.',
        retryAllowed: false,
        reference: _safeReference(body) ?? _safeErrorCode(body),
      ),
      _ => PosFailure(
        PosErrorKind.unknown,
        'NEXO respondió con un error.',
        retryAllowed: status >= 500,
        reference: _safeReference(body) ?? 'HTTP $status',
      ),
    };
  }

  String? _safeReference(String body) {
    try {
      final value = jsonDecode(body);
      return value is Map ? value['requestId']?.toString() : null;
    } catch (_) {
      return null;
    }
  }

  String? _safeErrorCode(String body) {
    try {
      final value = jsonDecode(body);
      final message = value is Map ? value['message']?.toString() : null;
      if (message == null || message.length > 160) return null;
      return Redactor.message(message);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
    required String fingerprint,
    required String deviceName,
  }) => _request(
    '/v1/auth/login',
    method: 'POST',
    body: {
      'email': email,
      'password': password,
      'deviceFingerprint': fingerprint,
      'deviceName': deviceName,
    },
  );
  @override
  Future<List<Map<String, dynamic>>> products(
    String organizationId,
    String branchId,
  ) async {
    final value = await _request(
      '/v1/organizations/$organizationId/products?branchId=$branchId',
    );
    return _rows(value);
  }

  @override
  Future<Map<String, dynamic>> createSale(
    String o,
    Map<String, dynamic> body,
    String key,
  ) => _request(
    '/v1/organizations/$o/sales',
    method: 'POST',
    body: body,
    idempotencyKey: key,
  );
  @override
  Future<Map<String, dynamic>> addItem(
    String o,
    String s,
    int v,
    Map<String, dynamic> body,
    String key,
  ) => _request(
    '/v1/organizations/$o/sales/$s/items',
    method: 'POST',
    body: body,
    idempotencyKey: key,
    expectedVersion: v,
  );
  @override
  Future<Map<String, dynamic>> checkout(
    String o,
    String s,
    int v,
    String key,
  ) => _request(
    '/v1/organizations/$o/sales/$s/checkout',
    method: 'POST',
    idempotencyKey: key,
    expectedVersion: v,
  );
  @override
  Future<Map<String, dynamic>> payment(
    String o,
    String s,
    Map<String, dynamic> body,
    String key,
  ) => _request(
    '/v1/organizations/$o/sales/$s/payments',
    method: 'POST',
    body: body,
    idempotencyKey: key,
  );
  @override
  Future<Map<String, dynamic>> complete(
    String o,
    String s,
    int v,
    String key,
  ) => _request(
    '/v1/organizations/$o/sales/$s/complete',
    method: 'POST',
    idempotencyKey: key,
    expectedVersion: v,
  );
  @override
  Future<Map<String, dynamic>> sale(String o, String s) =>
      _request('/v1/organizations/$o/sales/$s');
  @override
  Future<Map<String, dynamic>> paymentOutcome(
    String o,
    String s,
    String attempt,
  ) => _request('/v1/organizations/$o/sales/$s/payments/$attempt/outcome');
  @override
  Future<Map<String, dynamic>> paymentOutcomeByKey(
    String o,
    String s,
    String key,
  ) => _request(
    '/v1/organizations/$o/sales/$s/payment-outcome?idempotencyKey=${Uri.encodeQueryComponent(key)}',
  );
}

String stableRequestId(String path, String? key) =>
    '${path.hashCode.abs()}-${(key ?? 'read').hashCode.abs()}';
