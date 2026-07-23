# Receipts and printing

V1 status: **PASS**. Canonical receipt detail is cached in SQLite and reprinted through `TestPrinterAdapter`; print jobs are auditable and independent from sale completion.

Receipt retrieval exists after completion. Printing remains a separate adapter boundary: print failure cannot reverse or duplicate a completed sale. Hardware adapters are not claimed without device validation.
