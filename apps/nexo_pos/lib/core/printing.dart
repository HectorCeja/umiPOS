enum PrintJobStatus { queued, printing, printed, failed, cancelled, unknown }

class PrintResult {
  const PrintResult({required this.status, this.safeMessage});
  final PrintJobStatus status;
  final String? safeMessage;
  bool get successful => status == PrintJobStatus.printed;
}

abstract interface class PrinterAdapter {
  String get name;
  Future<PrintResult> printReceipt(Map<String, Object?> receipt);
  Future<bool> test();
}

/// Deterministic V1 adapter. It does not claim compatibility with physical
/// printer protocols that have not been contracted and verified.
class TestPrinterAdapter implements PrinterAdapter {
  TestPrinterAdapter({this.fail = false});
  final bool fail;
  final List<Map<String, Object?>> printed = [];
  @override
  String get name => 'NEXO Test Printer';
  @override
  Future<PrintResult> printReceipt(Map<String, Object?> receipt) async {
    if (fail) {
      return const PrintResult(
        status: PrintJobStatus.failed,
        safeMessage: 'La impresora de prueba rechazó el trabajo.',
      );
    }
    printed.add(Map<String, Object?>.from(receipt));
    return const PrintResult(status: PrintJobStatus.printed);
  }

  @override
  Future<bool> test() async => !fail;
}
