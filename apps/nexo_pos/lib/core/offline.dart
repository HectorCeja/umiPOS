import 'models.dart';

enum OfflineCapability {
  cachedCatalog,
  cartDraft,
  sale,
  cashPayment,
  externalPayment,
  refund,
  enrollment,
  branchSwitch,
  sync,
}

abstract final class OfflinePolicy {
  static bool allowed(OfflineCapability capability) => const {
    OfflineCapability.cachedCatalog,
    OfflineCapability.cartDraft,
  }.contains(capability);
  static void assertAllowed(OfflineCapability capability) {
    if (!allowed(capability)) {
      throw const PosFailure(
        PosErrorKind.offline,
        'Esta operación requiere conexión con NEXO.',
      );
    }
  }
}

class OutboxEntry {
  OutboxEntry({
    required this.id,
    required this.operation,
    required this.idempotencyKey,
    required this.createdAt,
    this.status = OutboxStatus.pending,
    this.dependsOn,
  });
  final String id, operation, idempotencyKey;
  final DateTime createdAt;
  final String? dependsOn;
  OutboxStatus status;
}

class LocalOutbox {
  final List<OutboxEntry> _entries = [];
  List<OutboxEntry> get entries => List.unmodifiable(_entries);
  void enqueue(OutboxEntry entry) {
    if (_entries.any((value) => value.idempotencyKey == entry.idempotencyKey)) {
      return;
    }
    _entries.add(entry);
  }

  List<OutboxEntry> ready() =>
      _entries
          .where(
            (entry) =>
                entry.status == OutboxStatus.pending &&
                (entry.dependsOn == null ||
                    _entries.any(
                      (parent) =>
                          parent.id == entry.dependsOn &&
                          parent.status == OutboxStatus.acknowledged,
                    )),
          )
          .toList()
        ..sort((a, b) => a.createdAt.compareTo(b.createdAt));
  void acknowledge(String id) =>
      _entries.firstWhere((entry) => entry.id == id).status =
          OutboxStatus.acknowledged;
}
