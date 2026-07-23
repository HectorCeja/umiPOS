import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

abstract interface class SecureStore {
  Future<void> write(String key, String value);
  Future<String?> read(String key);
  Future<void> delete(String key);
  Future<void> clear();
}

/// Test-only storage. Production bootstrap rejects this adapter.
class MemorySecureStore implements SecureStore {
  final Map<String, String> _values = {};
  @override
  Future<void> write(String key, String value) async => _values[key] = value;
  @override
  Future<String?> read(String key) async => _values[key];
  @override
  Future<void> delete(String key) async => _values.remove(key);
  @override
  Future<void> clear() async => _values.clear();
}

/// Production adapter backed by Keychain on Apple platforms, encrypted
/// preferences/Keystore on Android, and the platform credential vault where
/// supported. Initialization errors are terminal; plaintext fallback is never
/// used.
class PlatformSecureStore implements SecureStore {
  PlatformSecureStore({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage();
  final FlutterSecureStorage _storage;

  @override
  Future<void> write(String key, String value) =>
      _storage.write(key: key, value: value);
  @override
  Future<String?> read(String key) => _storage.read(key: key);
  @override
  Future<void> delete(String key) => _storage.delete(key: key);
  @override
  Future<void> clear() => _storage.deleteAll();
}

abstract final class Redactor {
  static String id(String value) => value.length < 8
      ? '***'
      : '${value.substring(0, 4)}…${value.substring(value.length - 4)}';
  static String message(String value) => value.replaceAll(
    RegExp(
      r'(authorization|password|token|cookie)\s*[:=]\s*[^\s,]+',
      caseSensitive: false,
    ),
    r'$1=[REDACTED]',
  );
}

String stableIdempotencyKey(String seed, String operation) =>
    sha256.convert(utf8.encode('$seed:$operation')).toString();
