import 'package:flutter/foundation.dart';

@immutable
class Money {
  const Money(this.minor, {this.currency = 'MXN', this.scale = 2});
  final int minor;
  final String currency;
  final int scale;
  Money operator +(Money other) {
    _same(other);
    return Money(minor + other.minor, currency: currency, scale: scale);
  }

  Money operator -(Money other) {
    _same(other);
    return Money(minor - other.minor, currency: currency, scale: scale);
  }

  Money times(int quantity) =>
      Money(minor * quantity, currency: currency, scale: scale);
  void _same(Money other) {
    if (currency != other.currency || scale != other.scale) {
      throw ArgumentError('Money currency/scale mismatch');
    }
  }

  String get wireMinor => minor.toString();
}

enum PosErrorKind {
  validation,
  unauthorized,
  forbidden,
  sessionExpired,
  deviceNotEnrolled,
  deviceRevoked,
  tenantUnavailable,
  branchUnavailable,
  cashSessionRequired,
  conflict,
  optimisticLocking,
  duplicateIdempotency,
  insufficientStock,
  paymentRejected,
  paymentUnknown,
  backendUnavailable,
  timeout,
  offline,
  syncConflict,
  storageFailure,
  printerFailure,
  unsupportedVersion,
  unknown,
}

@immutable
class PosFailure implements Exception {
  const PosFailure(
    this.kind,
    this.safeMessage, {
    this.retryAllowed = false,
    this.reference,
  });
  final PosErrorKind kind;
  final String safeMessage;
  final bool retryAllowed;
  final String? reference;
  bool get blocksOperation => const {
    PosErrorKind.paymentUnknown,
    PosErrorKind.deviceRevoked,
    PosErrorKind.storageFailure,
    PosErrorKind.unsupportedVersion,
  }.contains(kind);
}

enum ConnectivityState { online, degraded, backendUnavailable, offline }

enum DeviceStatus {
  notEnrolled,
  pending,
  active,
  revoked,
  disabled,
  outdated,
  maintenance,
  offline,
  unknown,
}

enum SessionStatus {
  unauthenticated,
  authenticating,
  authenticated,
  refreshing,
  expired,
  revoked,
  locked,
  loggingOut,
  error,
}

enum CashSessionStatus {
  none,
  opening,
  open,
  closing,
  closed,
  interrupted,
  reconciliationRequired,
  conflict,
}

enum CheckoutStatus {
  reviewing,
  validating,
  awaitingPayment,
  processingPayment,
  partiallyPaid,
  finalizing,
  completed,
  failed,
  unknownOutcome,
  recoverable,
  cancelled,
}

enum PaymentMethod { cash, external, mixed }

enum PaymentStatus {
  pending,
  processing,
  approved,
  declined,
  cancelled,
  failed,
  unknown,
  reversed,
  refunded,
  partiallyRefunded,
}

enum OutboxStatus {
  pending,
  sending,
  acknowledged,
  retryableFailure,
  terminalFailure,
  conflict,
  manualReview,
  cancelled,
}

@immutable
class PosProduct {
  const PosProduct({
    required this.id,
    required this.variantId,
    required this.name,
    required this.price,
    this.barcode,
    this.available = true,
  });
  final String id, variantId, name;
  final Money price;
  final String? barcode;
  final bool available;
}

@immutable
class CartLine {
  const CartLine({required this.product, required this.quantity});
  final PosProduct product;
  final int quantity;
  Money get subtotal => product.price.times(quantity);
  CartLine copyWith({int? quantity}) =>
      CartLine(product: product, quantity: quantity ?? this.quantity);
}

class PosCart extends ChangeNotifier {
  PosCart({
    required this.localId,
    required this.organizationId,
    required this.branchId,
    required this.deviceId,
    required this.userId,
    required this.idempotencySeed,
  });
  final String localId,
      organizationId,
      branchId,
      deviceId,
      userId,
      idempotencySeed;
  final List<CartLine> _lines = [];
  List<CartLine> get lines => List.unmodifiable(_lines);
  Money get total =>
      _lines.fold(const Money(0), (sum, line) => sum + line.subtotal);
  void add(PosProduct product) {
    if (!product.available) {
      throw const PosFailure(
        PosErrorKind.validation,
        'El producto no está disponible.',
      );
    }
    final index = _lines.indexWhere(
      (line) => line.product.variantId == product.variantId,
    );
    if (index < 0) {
      _lines.add(CartLine(product: product, quantity: 1));
    } else {
      _lines[index] = _lines[index].copyWith(
        quantity: _lines[index].quantity + 1,
      );
    }
    notifyListeners();
  }

  void setQuantity(String variantId, int quantity) {
    if (quantity < 0) {
      throw const PosFailure(PosErrorKind.validation, 'Cantidad inválida.');
    }
    final index = _lines.indexWhere(
      (line) => line.product.variantId == variantId,
    );
    if (index < 0) return;
    if (quantity == 0) {
      _lines.removeAt(index);
    } else {
      _lines[index] = _lines[index].copyWith(quantity: quantity);
    }
    notifyListeners();
  }

  void clear() {
    _lines.clear();
    notifyListeners();
  }
}
