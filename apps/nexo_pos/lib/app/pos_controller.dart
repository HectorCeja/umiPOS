import 'dart:async';
import 'package:flutter/foundation.dart';
import '../core/api.dart';
import '../core/local_database.dart';
import '../core/models.dart';
import '../core/printing.dart';
import '../core/security.dart';

class PosController extends ChangeNotifier {
  PosController({
    required this.api,
    required this.cart,
    this.database,
    PrinterAdapter? printer,
  }) : printer = printer ?? TestPrinterAdapter() {
    cart.addListener(_onCartChanged);
  }
  final PosApi api;
  final PosCart cart;
  final PosLocalDatabase? database;
  final PrinterAdapter printer;
  SessionStatus session = SessionStatus.unauthenticated;
  DeviceStatus device = DeviceStatus.notEnrolled;
  CashSessionStatus cash = CashSessionStatus.none;
  CheckoutStatus checkout = CheckoutStatus.reviewing;
  ConnectivityState connectivity = ConnectivityState.online;
  List<PosProduct> catalog = const [];
  String? saleId, receiptId, paymentAttemptId;
  Map<String, dynamic>? receiptSnapshot;
  Money? authoritativeTotal;
  PrintResult? lastPrintResult;
  int saleVersion = 0;
  PosFailure? failure;
  bool _submitting = false;
  String? _lastScannedBarcode;
  DateTime? _lastScanAt;

  void _onCartChanged() => notifyListeners();

  void refreshView() => notifyListeners();

  bool scanBarcode(String raw, {DateTime? now}) {
    final barcode = raw.trim();
    if (barcode.isEmpty) return false;
    final timestamp = now ?? DateTime.now();
    if (_lastScannedBarcode == barcode &&
        _lastScanAt != null &&
        timestamp.difference(_lastScanAt!) <
            const Duration(milliseconds: 500)) {
      return false;
    }
    final matches = catalog.where((product) => product.barcode == barcode);
    if (matches.isEmpty) {
      failure = const PosFailure(
        PosErrorKind.validation,
        'No encontramos un producto con ese código.',
      );
      notifyListeners();
      return false;
    }
    cart.add(matches.first);
    _lastScannedBarcode = barcode;
    _lastScanAt = timestamp;
    failure = null;
    notifyListeners();
    return true;
  }

  Future<void> loadCatalog() async {
    final rows = await api.products(cart.organizationId, cart.branchId);
    catalog = rows.expand(_catalogProducts).toList(growable: false);
    notifyListeners();
  }

  Iterable<PosProduct> _catalogProducts(Map<String, dynamic> row) sync* {
    final variants = (row['variants'] as List?)
        ?.whereType<Map>()
        .map((value) => Map<String, dynamic>.from(value))
        .toList(growable: false);
    if (variants == null || variants.isEmpty) {
      yield PosProduct(
        id: row['id']?.toString() ?? '',
        variantId: row['variantId']?.toString() ?? row['id']?.toString() ?? '',
        name: row['name']?.toString() ?? 'Producto',
        price: Money(int.tryParse(row['priceMinor']?.toString() ?? '') ?? 0),
        barcode: row['barcode']?.toString(),
        available: row['status']?.toString() != 'ARCHIVED',
      );
      return;
    }
    final prices =
        (row['prices'] as List?)?.whereType<Map>().map(
          (value) => Map<String, dynamic>.from(value),
        ) ??
        const Iterable<Map<String, dynamic>>.empty();
    final barcodes =
        (row['barcodes'] as List?)?.whereType<Map>().map(
          (value) => Map<String, dynamic>.from(value),
        ) ??
        const Iterable<Map<String, dynamic>>.empty();
    for (final variant in variants) {
      final variantId = variant['id']?.toString() ?? '';
      final matchingPrices = prices.where(
        (price) =>
            price['variantId']?.toString() == variantId &&
            price['active'] != false,
      );
      if (matchingPrices.isEmpty) continue;
      final price = matchingPrices.first;
      final matchingBarcodes = barcodes.where(
        (barcode) => barcode['variantId']?.toString() == variantId,
      );
      final productName = row['name']?.toString() ?? 'Producto';
      final variantName = variant['name']?.toString();
      yield PosProduct(
        id: row['id']?.toString() ?? '',
        variantId: variantId,
        name: variants.length > 1 && variantName != null
            ? '$productName · $variantName'
            : productName,
        price: Money(_decimalToMinor(price['amount']?.toString() ?? '0')),
        barcode: matchingBarcodes.isEmpty
            ? null
            : matchingBarcodes.first['normalizedValue']?.toString() ??
                  matchingBarcodes.first['value']?.toString(),
        available:
            row['status']?.toString() == 'ACTIVE' &&
            !{'ARCHIVED', 'DISABLED'}.contains(variant['status']?.toString()),
      );
    }
  }

  Future<void> finalizeCash(Money tendered) async {
    await _finalizePayment(
      method: 'CASH',
      tendered: tendered,
      paymentKey: 'payment:cash',
    );
  }

  Future<void> finalizeExternal({
    required String method,
    required String reference,
    required bool explicitlyConfirmed,
  }) async {
    if (!explicitlyConfirmed) {
      throw const PosFailure(
        PosErrorKind.validation,
        'Confirma que el proveedor externo aprobó el pago.',
      );
    }
    if (!{'CARD_EXTERNAL', 'BANK_TRANSFER', 'OTHER'}.contains(method)) {
      throw const PosFailure(
        PosErrorKind.validation,
        'El medio de pago externo no es válido.',
      );
    }
    final normalizedReference = reference.trim();
    if (normalizedReference.isEmpty || normalizedReference.length > 200) {
      throw const PosFailure(
        PosErrorKind.validation,
        'Captura una referencia no sensible válida.',
      );
    }
    await _finalizePayment(
      method: method,
      providerReference: normalizedReference,
      paymentKey: 'payment:external:$method',
    );
  }

  Future<void> _finalizePayment({
    required String method,
    required String paymentKey,
    Money? tendered,
    String? providerReference,
  }) async {
    if (_submitting) return;
    if (connectivity != ConnectivityState.online) {
      throw const PosFailure(
        PosErrorKind.offline,
        'La venta no puede finalizarse offline: falta contrato de reconciliación.',
      );
    }
    if (cash != CashSessionStatus.open) {
      throw const PosFailure(
        PosErrorKind.cashSessionRequired,
        'Abre una sesión de caja antes de cobrar.',
      );
    }
    if (method == 'CASH' && tendered == null) {
      throw const PosFailure(
        PosErrorKind.validation,
        'El efectivo recibido es insuficiente.',
      );
    }
    _submitting = true;
    failure = null;
    try {
      checkout = CheckoutStatus.validating;
      notifyListeners();
      final createKey = stableIdempotencyKey(cart.idempotencySeed, 'create');
      final created = await api.createSale(cart.organizationId, {
        'branchId': cart.branchId,
        'currency': cart.total.currency,
        'channel': 'FLUTTER_POS',
        'businessDate': DateTime.now().toIso8601String().substring(0, 10),
      }, createKey);
      saleId = created['id']?.toString() ?? created['saleId']?.toString();
      saleVersion = int.tryParse(created['version']?.toString() ?? '') ?? 0;
      if (saleId == null) {
        throw const PosFailure(
          PosErrorKind.unknown,
          'NEXO no devolvió el identificador de venta.',
        );
      }
      for (var i = 0; i < cart.lines.length; i++) {
        final line = cart.lines[i];
        final result = await api.addItem(
          cart.organizationId,
          saleId!,
          saleVersion,
          {
            'productVariantId': line.product.variantId,
            'quantity': line.quantity.toString(),
          },
          stableIdempotencyKey(cart.idempotencySeed, 'item:$i'),
        );
        saleVersion =
            int.tryParse(result['saleVersion']?.toString() ?? '') ??
            saleVersion + 1;
      }
      final priced = await api.checkout(
        cart.organizationId,
        saleId!,
        saleVersion,
        stableIdempotencyKey(cart.idempotencySeed, 'checkout'),
      );
      saleVersion =
          int.tryParse(
            (priced['saleVersion'] ?? priced['version'])?.toString() ?? '',
          ) ??
          saleVersion;
      final pricedMinor = int.tryParse(priced['totalMinor']?.toString() ?? '');
      if (pricedMinor == null || pricedMinor < 0) {
        throw const PosFailure(
          PosErrorKind.validation,
          'NEXO no devolvió un total autoritativo válido.',
        );
      }
      authoritativeTotal = Money(pricedMinor, currency: cart.total.currency);
      if (method == 'CASH' && tendered!.minor < authoritativeTotal!.minor) {
        throw PosFailure(
          PosErrorKind.validation,
          'El efectivo recibido es menor al total autoritativo de ${authoritativeTotal!.wireMinor} centavos.',
        );
      }
      checkout = CheckoutStatus.processingPayment;
      notifyListeners();
      final stablePaymentKey = stableIdempotencyKey(
        cart.idempotencySeed,
        paymentKey,
      );
      final pendingRecoveryId = 'pending:$stablePaymentKey';
      database?.savePaymentRecovery(
        id: pendingRecoveryId,
        saleId: saleId!,
        idempotencyKey: stablePaymentKey,
        status: 'processing',
        payload: {
          'organizationId': cart.organizationId,
          'lookupByKey': true,
          'completeKey': stableIdempotencyKey(cart.idempotencySeed, 'complete'),
          'receiptKey': stableIdempotencyKey(cart.idempotencySeed, 'receipt'),
        },
      );
      try {
        final payment = await api.payment(cart.organizationId, saleId!, {
          'method': method,
          'amountMinor': authoritativeTotal!.wireMinor,
          if (tendered != null) 'tenderedMinor': tendered.wireMinor,
          'providerReference': ?providerReference,
        }, stablePaymentKey);
        paymentAttemptId =
            payment['paymentAttemptId']?.toString() ??
            payment['id']?.toString();
        saleVersion =
            int.tryParse(
              (payment['saleVersion'] ?? payment['version'])?.toString() ?? '',
            ) ??
            saleVersion;
        if (paymentAttemptId != null) {
          database?.savePaymentRecovery(
            id: pendingRecoveryId,
            saleId: saleId!,
            idempotencyKey: stablePaymentKey,
            // A captured payment is not locally resolved until Sale completion
            // and the authoritative Receipt have both been recovered. Keeping
            // this checkpoint pending makes an app/process crash in that window
            // discoverable on the next bootstrap without recreating the charge.
            status: 'processing',
            payload: {
              'organizationId': cart.organizationId,
              'paymentAttemptId': paymentAttemptId,
              'lookupByKey': true,
              'completeKey': stableIdempotencyKey(
                cart.idempotencySeed,
                'complete',
              ),
              'receiptKey': stableIdempotencyKey(
                cart.idempotencySeed,
                'receipt',
              ),
            },
          );
        }
      } on PosFailure catch (error) {
        if (error.kind == PosErrorKind.timeout ||
            error.kind == PosErrorKind.backendUnavailable) {
          checkout = CheckoutStatus.unknownOutcome;
          failure = const PosFailure(
            PosErrorKind.paymentUnknown,
            'No repitas el cobro. Consulta el estado de la venta.',
            retryAllowed: false,
          );
          notifyListeners();
          return;
        }
        rethrow;
      }
      checkout = CheckoutStatus.finalizing;
      notifyListeners();
      await _completeAndLoadReceipt();
    } on PosFailure catch (error) {
      failure = error;
      if (checkout != CheckoutStatus.unknownOutcome) {
        checkout = CheckoutStatus.failed;
      }
      notifyListeners();
    } finally {
      _submitting = false;
    }
  }

  Future<PrintResult> printReceipt() async {
    final receipt = receiptSnapshot;
    if (receipt == null) {
      return lastPrintResult = const PrintResult(
        status: PrintJobStatus.failed,
        safeMessage: 'No existe un recibo autoritativo para imprimir.',
      );
    }
    lastPrintResult = await printer.printReceipt(
      Map<String, Object?>.from(receipt),
    );
    database?.recordPrintJob(
      receiptId: receiptId!,
      status: lastPrintResult!.status.name,
      adapter: printer.name,
      safeError: lastPrintResult!.safeMessage,
    );
    notifyListeners();
    return lastPrintResult!;
  }

  Future<void> recoverUnknown() async {
    if (saleId == null) return;
    if (paymentAttemptId != null) {
      final outcome = await api.paymentOutcome(
        cart.organizationId,
        saleId!,
        paymentAttemptId!,
      );
      final status = outcome['status']?.toString();
      if ({'approved', 'APPROVED', 'CAPTURED'}.contains(status)) {
        checkout = CheckoutStatus.finalizing;
        failure = null;
        final snapshot = await api.sale(cart.organizationId, saleId!);
        if (snapshot['status']?.toString() == 'COMPLETED') {
          receiptId = snapshot['receiptId']?.toString();
          await _loadReceipt();
          checkout = CheckoutStatus.completed;
        } else {
          saleVersion =
              int.tryParse(snapshot['version']?.toString() ?? '') ??
              saleVersion;
          await _completeAndLoadReceipt();
        }
      } else {
        checkout = CheckoutStatus.unknownOutcome;
        failure = PosFailure(
          PosErrorKind.paymentUnknown,
          'El pago permanece en estado ${status ?? 'desconocido'}. No repitas el cobro.',
          retryAllowed: false,
          reference: outcome['safeDisplayReference']?.toString(),
        );
      }
      notifyListeners();
      return;
    }
    final byKey = await api.paymentOutcomeByKey(
      cart.organizationId,
      saleId!,
      stableIdempotencyKey(cart.idempotencySeed, 'payment:cash'),
    );
    final recoveredStatus = byKey['status']?.toString();
    paymentAttemptId =
        byKey['paymentAttemptId']?.toString() ?? byKey['id']?.toString();
    if ({'approved', 'APPROVED', 'CAPTURED'}.contains(recoveredStatus)) {
      checkout = CheckoutStatus.finalizing;
      failure = null;
      final snapshot = await api.sale(cart.organizationId, saleId!);
      if (snapshot['status']?.toString() == 'COMPLETED') {
        receiptId = snapshot['receiptId']?.toString();
        await _loadReceipt();
        checkout = CheckoutStatus.completed;
      } else {
        saleVersion =
            int.tryParse(snapshot['version']?.toString() ?? '') ?? saleVersion;
        await _completeAndLoadReceipt();
      }
      return;
    }
    final snapshot = await api.sale(cart.organizationId, saleId!);
    final status = snapshot['status']?.toString();
    if (status == 'COMPLETED') {
      receiptId = snapshot['receiptId']?.toString();
      await _loadReceipt();
      checkout = CheckoutStatus.completed;
    } else {
      checkout = CheckoutStatus.unknownOutcome;
      failure = const PosFailure(
        PosErrorKind.paymentUnknown,
        'No existe identificador persistido del intento; requiere revisión segura.',
        retryAllowed: false,
      );
    }
    notifyListeners();
  }

  Future<void> _completeAndLoadReceipt() async {
    final complete = await api.complete(
      cart.organizationId,
      saleId!,
      saleVersion,
      stableIdempotencyKey(cart.idempotencySeed, 'complete'),
    );
    receiptId = complete['receiptId']?.toString();
    await _loadReceipt();
    // Resolve the exact persisted checkpoint rather than reconstructing a key;
    // this works for both cash and external payment operations.
    final pending = database?.pendingPaymentRecoveries().where(
      (row) => row['sale_id']?.toString() == saleId,
    );
    if (pending != null && pending.isNotEmpty) {
      final row = pending.first;
      database?.savePaymentRecovery(
        id: row['id']!.toString(),
        saleId: saleId!,
        idempotencyKey: row['idempotency_key']!.toString(),
        status: 'completed',
        payload: {
          'organizationId': cart.organizationId,
          'paymentAttemptId': paymentAttemptId,
          'receiptId': receiptId,
        },
      );
    }
    checkout = CheckoutStatus.completed;
    notifyListeners();
  }

  Future<void> _loadReceipt() async {
    final recoveredReceipt = await api.receipt(
      cart.organizationId,
      saleId!,
      stableIdempotencyKey(cart.idempotencySeed, 'receipt'),
    );
    receiptSnapshot = recoveredReceipt;
    receiptId ??=
        recoveredReceipt['id']?.toString() ??
        recoveredReceipt['receiptId']?.toString();
    if (receiptId != null) {
      database?.saveReceipt(
        id: receiptId!,
        saleId: saleId!,
        payload: Map<String, Object?>.from(recoveredReceipt),
      );
    }
  }

  @override
  void dispose() {
    cart.removeListener(_onCartChanged);
    super.dispose();
  }
}

int _decimalToMinor(String value) {
  final match = RegExp(r'^(\d+)(?:\.(\d+))?$').firstMatch(value.trim());
  if (match == null) {
    throw const PosFailure(
      PosErrorKind.validation,
      'El catálogo contiene un precio inválido.',
    );
  }
  final whole = int.parse(match.group(1)!);
  final fraction = (match.group(2) ?? '').padRight(2, '0');
  final beyondMinor = fraction.length > 2 ? fraction.substring(2) : '';
  if (beyondMinor.runes.any((digit) => digit != 48)) {
    throw const PosFailure(
      PosErrorKind.validation,
      'El precio requiere una precisión no soportada por la moneda.',
    );
  }
  return whole * 100 + int.parse(fraction.substring(0, 2));
}
