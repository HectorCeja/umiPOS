import 'package:flutter/foundation.dart';

import '../core/models.dart';

enum PosBootstrapRoute {
  booting,
  enrollmentRequired,
  authentication,
  organizationRequired,
  branchRequired,
  cashSessionRequired,
  operational,
  restricted,
  offlineRecovery,
  forcedLogout,
  deviceRevoked,
  maintenance,
}

@immutable
class PosBootstrapSnapshot {
  const PosBootstrapSnapshot({
    required this.device,
    required this.session,
    required this.cash,
    required this.connectivity,
    this.organizationId,
    this.branchId,
    this.pendingOperations = 0,
  });

  final DeviceStatus device;
  final SessionStatus session;
  final CashSessionStatus cash;
  final ConnectivityState connectivity;
  final String? organizationId;
  final String? branchId;
  final int pendingOperations;
}

/// Deterministic routing policy. Backend authorization remains authoritative.
abstract final class PosBootstrapPolicy {
  static PosBootstrapRoute resolve(PosBootstrapSnapshot state) {
    if (state.device == DeviceStatus.revoked) {
      return PosBootstrapRoute.deviceRevoked;
    }
    if (state.device == DeviceStatus.maintenance ||
        state.device == DeviceStatus.outdated) {
      return PosBootstrapRoute.maintenance;
    }
    if (state.device != DeviceStatus.active) {
      return PosBootstrapRoute.enrollmentRequired;
    }
    if (state.session != SessionStatus.authenticated) {
      return PosBootstrapRoute.authentication;
    }
    if (state.organizationId == null) {
      return PosBootstrapRoute.organizationRequired;
    }
    if (state.branchId == null) {
      return PosBootstrapRoute.branchRequired;
    }
    if (state.connectivity != ConnectivityState.online &&
        state.pendingOperations > 0) {
      return PosBootstrapRoute.offlineRecovery;
    }
    if (state.cash != CashSessionStatus.open) {
      return PosBootstrapRoute.cashSessionRequired;
    }
    return PosBootstrapRoute.operational;
  }
}
