import 'dart:io';
import 'local_database.dart';
import 'printing.dart';

class PosDiagnostics {
  PosDiagnostics({required this.database, required this.printer});
  final PosLocalDatabase database;
  final PrinterAdapter printer;

  Map<String, Object?> snapshot({
    required String deviceStatus,
    required String sessionStatus,
    String? organizationId,
    String? branchId,
    String? cashSessionId,
    String? safeLastError,
  }) => {
    'appVersion': '1.0.0',
    'platform': Platform.operatingSystem,
    'deviceStatus': deviceStatus,
    'sessionStatus': sessionStatus,
    'organization': _redacted(organizationId),
    'branch': _redacted(branchId),
    'cashSession': _redacted(cashSessionId),
    'sqliteVersion': database.userVersion,
    'pendingPaymentRecovery': database.pendingRecoveryCount,
    'printer': printer.name,
    'lastError': safeLastError,
  };

  String? _redacted(String? value) {
    if (value == null || value.length < 8) return value;
    return '${value.substring(0, 4)}…${value.substring(value.length - 4)}';
  }
}
