import 'dart:convert';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:sqlite3/sqlite3.dart';

enum LocalOperationState {
  pending,
  sending,
  acknowledged,
  retryable,
  conflict,
  rejected,
  manualReview,
  cancelled,
}

class PosLocalDatabase {
  PosLocalDatabase._(this._db);
  final Database _db;
  static const schemaVersion = 2;

  static Future<PosLocalDatabase> open({String? path}) async {
    final resolved =
        path ??
        '${(await getApplicationSupportDirectory()).path}${Platform.pathSeparator}nexo-pos.sqlite3';
    final database = sqlite3.open(resolved);
    final result = PosLocalDatabase._(database);
    result._migrate();
    return result;
  }

  void _migrate() {
    final current = _db.userVersion;
    if (current > schemaVersion) {
      throw StateError('Local database is newer than this app');
    }
    if (current == 0) {
      _db.execute('BEGIN IMMEDIATE');
      try {
        _db.execute('''
          CREATE TABLE local_metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL,updated_at TEXT NOT NULL);
          CREATE TABLE cart_drafts(id TEXT PRIMARY KEY,organization_id TEXT NOT NULL,branch_id TEXT NOT NULL,payload TEXT NOT NULL,updated_at TEXT NOT NULL);
          CREATE TABLE payment_recovery(id TEXT PRIMARY KEY,sale_id TEXT NOT NULL,idempotency_key TEXT NOT NULL UNIQUE,status TEXT NOT NULL,payload TEXT NOT NULL,updated_at TEXT NOT NULL);
          CREATE TABLE receipts(id TEXT PRIMARY KEY,sale_id TEXT NOT NULL,payload TEXT NOT NULL,official INTEGER NOT NULL,created_at TEXT NOT NULL);
          CREATE TABLE print_jobs(id INTEGER PRIMARY KEY AUTOINCREMENT,receipt_id TEXT NOT NULL,status TEXT NOT NULL,adapter TEXT NOT NULL,safe_error TEXT,created_at TEXT NOT NULL);
          CREATE TABLE local_outbox(id TEXT PRIMARY KEY,operation_type TEXT NOT NULL,idempotency_key TEXT NOT NULL UNIQUE,payload_version INTEGER NOT NULL,payload TEXT NOT NULL,depends_on TEXT,state TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,next_attempt_at TEXT NOT NULL,last_error TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
          CREATE INDEX local_outbox_ready ON local_outbox(state,next_attempt_at,created_at);
        ''');
        _db.userVersion = schemaVersion;
        _db.execute('COMMIT');
      } catch (_) {
        _db.execute('ROLLBACK');
        rethrow;
      }
    }
    if (current == 1) {
      _db.execute('BEGIN IMMEDIATE');
      try {
        _db.execute('''
          CREATE TABLE print_jobs(id INTEGER PRIMARY KEY AUTOINCREMENT,receipt_id TEXT NOT NULL,status TEXT NOT NULL,adapter TEXT NOT NULL,safe_error TEXT,created_at TEXT NOT NULL);
        ''');
        _db.userVersion = schemaVersion;
        _db.execute('COMMIT');
      } catch (_) {
        _db.execute('ROLLBACK');
        rethrow;
      }
    }
  }

  void enqueue({
    required String id,
    required String operationType,
    required String idempotencyKey,
    required Map<String, Object?> payload,
    String? dependsOn,
  }) {
    final now = DateTime.now().toUtc().toIso8601String();
    _db.execute(
      'INSERT OR IGNORE INTO local_outbox(id,operation_type,idempotency_key,payload_version,payload,depends_on,state,next_attempt_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)',
      [
        id,
        operationType,
        idempotencyKey,
        1,
        jsonEncode(payload),
        dependsOn,
        LocalOperationState.pending.name,
        now,
        now,
        now,
      ],
    );
  }

  List<Map<String, Object?>> ready() => _db
      .select(
        '''SELECT o.* FROM local_outbox o LEFT JOIN local_outbox p ON p.id=o.depends_on WHERE o.state=? AND o.next_attempt_at<=? AND (o.depends_on IS NULL OR p.state=?) ORDER BY o.created_at''',
        [
          LocalOperationState.pending.name,
          DateTime.now().toUtc().toIso8601String(),
          LocalOperationState.acknowledged.name,
        ],
      )
      .map((row) => Map<String, Object?>.from(row))
      .toList(growable: false);

  void transition(String id, LocalOperationState state, {String? safeError}) {
    _db.execute(
      'UPDATE local_outbox SET state=?,last_error=?,attempts=attempts+1,updated_at=? WHERE id=?',
      [state.name, safeError, DateTime.now().toUtc().toIso8601String(), id],
    );
  }

  void savePaymentRecovery({
    required String id,
    required String saleId,
    required String idempotencyKey,
    required String status,
    required Map<String, Object?> payload,
  }) {
    _db.execute(
      'INSERT INTO payment_recovery(id,sale_id,idempotency_key,status,payload,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,payload=excluded.payload,updated_at=excluded.updated_at',
      [
        id,
        saleId,
        idempotencyKey,
        status,
        jsonEncode(payload),
        DateTime.now().toUtc().toIso8601String(),
      ],
    );
  }

  List<Map<String, Object?>> pendingPaymentRecoveries() => _db
      .select(
        "SELECT * FROM payment_recovery WHERE status IN ('processing','unknown','PROCESSING','UNKNOWN') ORDER BY updated_at",
      )
      .map((row) => Map<String, Object?>.from(row))
      .toList(growable: false);

  void saveReceipt({
    required String id,
    required String saleId,
    required Map<String, Object?> payload,
  }) {
    _db.execute(
      'INSERT INTO receipts(id,sale_id,payload,official,created_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,official=excluded.official',
      [
        id,
        saleId,
        jsonEncode(payload),
        1,
        DateTime.now().toUtc().toIso8601String(),
      ],
    );
  }

  Map<String, Object?>? receipt(String id) {
    final rows = _db.select('SELECT * FROM receipts WHERE id=?', [id]);
    return rows.isEmpty ? null : Map<String, Object?>.from(rows.single);
  }

  List<Map<String, Object?>> receiptsForSale(String saleId) => _db
      .select('SELECT * FROM receipts WHERE sale_id=? ORDER BY created_at', [
        saleId,
      ])
      .map((row) => Map<String, Object?>.from(row))
      .toList(growable: false);

  void recordPrintJob({
    required String receiptId,
    required String status,
    required String adapter,
    String? safeError,
  }) {
    _db.execute(
      'INSERT INTO print_jobs(receipt_id,status,adapter,safe_error,created_at) VALUES(?,?,?,?,?)',
      [
        receiptId,
        status,
        adapter,
        safeError,
        DateTime.now().toUtc().toIso8601String(),
      ],
    );
  }

  List<Map<String, Object?>> printJobs(String receiptId) => _db
      .select('SELECT * FROM print_jobs WHERE receipt_id=? ORDER BY id', [
        receiptId,
      ])
      .map((row) => Map<String, Object?>.from(row))
      .toList(growable: false);

  int get pendingRecoveryCount =>
      _db
              .select(
                "SELECT COUNT(*) AS count FROM payment_recovery WHERE status IN ('processing','unknown','PROCESSING','UNKNOWN')",
              )
              .single['count']
          as int;

  int get userVersion => _db.userVersion;

  void close() => _db.close();
}
