import 'dart:async';
import 'dart:math';

import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';

import '../core/api.dart';
import '../core/diagnostics.dart';
import '../core/local_database.dart';
import '../core/models.dart';
import '../core/printing.dart';
import '../core/recovery.dart';
import '../core/security.dart';
import 'bootstrap.dart';
import 'pos_controller.dart';

class ProductivePosCoordinator extends ChangeNotifier {
  ProductivePosCoordinator({
    required this.api,
    required this.secureStore,
    required this.database,
  });

  final OpenApiPosClient api;
  final SecureStore secureStore;
  final PosLocalDatabase database;
  PosBootstrapRoute route = PosBootstrapRoute.booting;
  bool busy = false;
  PosFailure? failure;
  String? organizationId, branchId, deviceId, userId, cashSessionId;
  int cashSessionVersion = 0;
  Map<String, dynamic>? cashSummary;
  List<Map<String, dynamic>> availableBranches = const [];
  List<Map<String, dynamic>> availableRegisters = const [];
  Set<String> permissions = const {};
  final PrinterAdapter printer = TestPrinterAdapter();
  late final RecoveryCoordinator recovery = RecoveryCoordinator(
    api: api,
    database: database,
  );
  late final PosDiagnostics diagnostics = PosDiagnostics(
    database: database,
    printer: printer,
  );
  RecoveryResult? lastRecovery;
  PosController? operational;
  Future<void>? _refreshFlight;

  Future<void> bootstrap() async {
    busy = true;
    failure = null;
    notifyListeners();
    try {
      organizationId = await secureStore.read('device.organization');
      if (organizationId == null) {
        route = PosBootstrapRoute.enrollmentRequired;
        return;
      }
      final device = await api.currentDevice(organizationId!);
      deviceId = device['id']?.toString();
      final status = device['status']?.toString();
      if (status == 'REVOKED' || status == 'DISABLED') {
        await _clearSessionOnly();
        route = PosBootstrapRoute.deviceRevoked;
        return;
      }
      try {
        final identity = await api.identity();
        userId = identity['userId']?.toString();
      } on PosFailure catch (error) {
        if (error.kind != PosErrorKind.sessionExpired) rethrow;
        try {
          await refreshSingleFlight();
          final identity = await api.identity();
          userId = identity['userId']?.toString();
        } on PosFailure {
          route = PosBootstrapRoute.authentication;
          return;
        }
      }
      await loadContext();
    } on PosFailure catch (error) {
      failure = error;
      route = error.kind == PosErrorKind.deviceRevoked
          ? PosBootstrapRoute.deviceRevoked
          : PosBootstrapRoute.restricted;
    } finally {
      busy = false;
      notifyListeners();
    }
  }

  Future<void> enroll({
    required String organization,
    required String token,
  }) async {
    await _run(() async {
      final seed = await _deviceSeed();
      final key = stableIdempotencyKey(seed, 'device-enrollment:$organization');
      final result = await api.enrollDevice(organization, {
        'token': token.trim(),
        'name': 'NEXO POS',
        'platform': defaultTargetPlatform.name,
        'appVersion': '1.0.0',
        'fingerprintHash': sha256.convert(seed.codeUnits).toString(),
        'idempotencyKey': key,
        'capabilities': {'touch': true, 'keyboard': true, 'scanner': true},
      });
      organizationId = organization;
      deviceId = (result['device'] as Map?)?['id']?.toString();
      route = PosBootstrapRoute.authentication;
    });
  }

  Future<void> login(String email, String password) async {
    await _run(() async {
      final seed = await _deviceSeed();
      await api.login(
        email: email,
        password: password,
        fingerprint: sha256.convert(seed.codeUnits).toString(),
        deviceName: 'NEXO POS',
      );
      final identity = await api.identity();
      userId = identity['userId']?.toString();
      await loadContext();
    });
  }

  Future<void> refreshSingleFlight() => _refreshFlight ??= api
      .refreshSession()
      .whenComplete(() => _refreshFlight = null);

  Future<void> logout({bool global = false}) async {
    await _run(() async {
      await api.logout(global: global);
      await _clearSessionOnly();
      route = PosBootstrapRoute.authentication;
    });
  }

  Future<void> loadContext() async {
    final organization = organizationId;
    if (organization == null) {
      route = PosBootstrapRoute.organizationRequired;
      return;
    }
    availableBranches = await api.branches(organization);
    final persistedBranch = await secureStore.read('context.branch');
    final active = availableBranches
        .where((branch) {
          final status = branch['status']?.toString();
          return status == null || !{'ARCHIVED', 'DISABLED'}.contains(status);
        })
        .toList(growable: false);
    if (persistedBranch != null &&
        active.any((branch) => branch['id']?.toString() == persistedBranch)) {
      await selectBranch(persistedBranch);
    } else if (active.length == 1) {
      await selectBranch(active.single['id'].toString());
    } else {
      branchId = null;
      route = PosBootstrapRoute.branchRequired;
    }
  }

  Future<void> selectBranch(String selected) async {
    final organization = organizationId!;
    await api.authorizationContext(organization, branchId: selected);
    final branchAllowed = availableBranches.any(
      (branch) => branch['id']?.toString() == selected,
    );
    if (!branchAllowed) {
      throw const PosFailure(
        PosErrorKind.branchUnavailable,
        'La sucursal no pertenece al contexto autorizado.',
      );
    }
    branchId = selected;
    const requiredPermissions = [
      'sales.create',
      'sales.suspend',
      'sales.resume',
      'sales.cancel',
      'sales.refund.request',
      'cash.session.open',
      'cash.movement.create',
      'cash.session.close',
      'sales.receipt.read',
      'sales.receipt.regenerate',
      'sales.diagnostics.read',
    ];
    final resolved = <String>{};
    for (final permission in requiredPermissions) {
      if (await api.evaluatePermission(
        organization,
        permission,
        branchId: selected,
      )) {
        resolved.add(permission);
      }
    }
    permissions = resolved;
    await secureStore.write('context.branch', selected);
    await _loadCash();
  }

  Future<void> _loadCash() async {
    try {
      final active = await api.activeCashSession(organizationId!, branchId!);
      cashSessionId =
          active['id']?.toString() ?? active['sessionId']?.toString();
      cashSessionVersion =
          int.tryParse(active['version']?.toString() ?? '') ?? 0;
    } on PosFailure catch (error) {
      if (error.kind != PosErrorKind.unknown &&
          error.kind != PosErrorKind.conflict) {
        rethrow;
      }
      cashSessionId = null;
    }
    if (cashSessionId == null) {
      availableRegisters = await api.cashRegisters(organizationId!, branchId!);
      route = PosBootstrapRoute.cashSessionRequired;
    } else {
      _createOperational();
      route = PosBootstrapRoute.operational;
    }
  }

  Future<void> openCash({
    required String registerId,
    required Money opening,
  }) async {
    await _run(() async {
      _require('cash.session.open');
      final key = stableIdempotencyKey(
        await _deviceSeed(),
        'cash-open:${branchId!}',
      );
      final session = await api.openCashSession(organizationId!, {
        'branchId': branchId,
        'registerId': registerId,
        'currency': opening.currency,
        'businessDate': DateTime.now().toIso8601String().substring(0, 10),
        'openingFloatMinor': opening.wireMinor,
        'idempotencyKey': key,
        'correlationId': _uuid(),
      }, key);
      cashSessionId =
          session['id']?.toString() ?? session['sessionId']?.toString();
      cashSessionVersion =
          int.tryParse(session['version']?.toString() ?? '') ?? 1;
      _createOperational();
      route = PosBootstrapRoute.operational;
    });
  }

  Future<Map<String, dynamic>?> refreshCashSummary() async {
    final session = cashSessionId;
    if (session == null) return null;
    cashSummary = await api.cashSummary(organizationId!, session);
    notifyListeners();
    return cashSummary;
  }

  Future<void> countAndCloseCash({required Money counted}) async {
    await _run(() async {
      _require('cash.session.close');
      final session = cashSessionId;
      if (session == null) {
        throw const PosFailure(
          PosErrorKind.cashSessionRequired,
          'No existe una sesión de caja activa.',
        );
      }
      final seed = await _deviceSeed();
      final countKey = stableIdempotencyKey(seed, 'cash-count:$session');
      final count = await api.cashCommand(
        organizationId!,
        session,
        'counts',
        countKey,
        body: {
          'currency': counted.currency,
          'totalMinor': counted.wireMinor,
          'idempotencyKey': countKey,
        },
      );
      cashSessionVersion =
          int.tryParse(count['version']?.toString() ?? '') ??
          cashSessionVersion + 1;
      final reconcileKey = stableIdempotencyKey(
        seed,
        'cash-reconcile:$session',
      );
      final reconciliation = await api.cashCommand(
        organizationId!,
        session,
        'reconcile',
        reconcileKey,
        body: {'idempotencyKey': reconcileKey},
      );
      cashSessionVersion =
          int.tryParse(reconciliation['version']?.toString() ?? '') ??
          cashSessionVersion;
      final ready = await api.cashSession(organizationId!, session);
      cashSessionVersion =
          int.tryParse(ready['version']?.toString() ?? '') ??
          cashSessionVersion;
      final closeKey = stableIdempotencyKey(seed, 'cash-close:$session');
      await api.cashCommand(
        organizationId!,
        session,
        'close',
        closeKey,
        body: {'idempotencyKey': closeKey, 'version': cashSessionVersion},
      );
      cashSessionId = null;
      cashSummary = null;
      operational?.dispose();
      operational = null;
      availableRegisters = await api.cashRegisters(organizationId!, branchId!);
      route = PosBootstrapRoute.cashSessionRequired;
    });
  }

  void _createOperational() {
    final cart = PosCart(
      localId: _uuid(),
      organizationId: organizationId!,
      branchId: branchId!,
      deviceId: deviceId!,
      userId: userId!,
      idempotencySeed: _uuid(),
    );
    operational?.dispose();
    operational = PosController(
      api: api,
      cart: cart,
      database: database,
      printer: printer,
    )..cash = CashSessionStatus.open;
    recovery
        .recoverPayments()
        .then((result) {
          lastRecovery = result;
          notifyListeners();
        })
        .catchError((Object error) {
          failure = const PosFailure(
            PosErrorKind.paymentUnknown,
            'Existe una recuperación financiera pendiente. No repitas el cobro.',
          );
          notifyListeners();
        });
  }

  void _require(String permission) {
    if (!permissions.contains(permission) && !permissions.contains('*')) {
      throw PosFailure(
        PosErrorKind.forbidden,
        'No tienes el permiso $permission para esta operación.',
      );
    }
  }

  Future<void> _clearSessionOnly() async {
    await secureStore.delete('session.cookies');
    userId = null;
    permissions = const {};
    operational?.dispose();
    operational = null;
  }

  Future<String> _deviceSeed() async {
    var value = await secureStore.read('device.local-seed');
    if (value == null) {
      value = '${_uuid()}-${_uuid()}';
      await secureStore.write('device.local-seed', value);
    }
    return value;
  }

  Future<void> _run(Future<void> Function() operation) async {
    if (busy) return;
    busy = true;
    failure = null;
    notifyListeners();
    try {
      await operation();
    } on PosFailure catch (error) {
      failure = error;
    } finally {
      busy = false;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    operational?.dispose();
    database.close();
    super.dispose();
  }
}

String _uuid() {
  final random = Random.secure();
  final bytes = List<int>.generate(16, (_) => random.nextInt(256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  final hex = bytes
      .map((value) => value.toRadixString(16).padLeft(2, '0'))
      .join();
  return '${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}';
}
