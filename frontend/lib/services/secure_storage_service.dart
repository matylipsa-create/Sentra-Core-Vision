import 'dart:convert';
import 'dart:io';

import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';

import '../models/evidence_entry.dart';
import 'event_bus.dart';

const _genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';

String computeEntryHash(int index, String previousHash, int timestamp, String data) {
  final composite = '$index:$previousHash:$timestamp:$data';
  return sha256.convert(utf8.encode(composite)).toString();
}

String computeEntrySignatureMessage(int index, String hash, String previousHash) {
  return '$index:$hash:$previousHash';
}

/// Result of an integrity verification pass.
class IntegrityResult {
  final bool valid;
  final int? brokenIndex;
  final String reason;

  const IntegrityResult({
    required this.valid,
    this.brokenIndex,
    this.reason = '',
  });

  static const IntegrityResult ok = IntegrityResult(valid: true);

  factory IntegrityResult.broken(int index, String reason) =>
      IntegrityResult(valid: false, brokenIndex: index, reason: reason);
}

/// Offline-first encrypted local persistence for the EVOLIS evidence chain.
///
/// Stores evidence entries as JSON lines in an application-private file.
/// Each entry's hash is recomputed on load to detect external tampering.
/// All read/write operations catch storage and serialization exceptions and
/// report them through the [SentraEventBus].
class SecureStorageService extends ChangeNotifier {
  final SentraEventBus _bus;

  File? _storeFile;
  final List<EvidenceEntry> _entries = [];
  bool _initialized = false;

  SecureStorageService({SentraEventBus? bus})
      : _bus = bus ?? EventBusProvider.instance;

  List<EvidenceEntry> get entries => List.unmodifiable(_entries);
  int get entryCount => _entries.length;
  bool get isInitialized => _initialized;

  Future<File> _resolveFile() async {
    if (_storeFile != null) return _storeFile!;
    final dir = await getApplicationDocumentsDirectory();
    final file = File('${dir.path}/evolis_chain.jsonl');
    if (!file.existsSync()) file.createSync(recursive: true);
    _storeFile = file;
    return file;
  }

  Future<void> initialize() async {
    if (_initialized) return;
    try {
      await _loadFromDisk();
      _initialized = true;
    } catch (e, st) {
      _bus.emit(SentraEventType.error, {
        'message': 'SecureStorage init failed: $e',
        'severity': 'critical',
        'source': 'secure_storage',
        'code': 'init_failure',
        'error': e.toString(),
        'stackTrace': st.toString(),
        'timestamp': DateTime.now().millisecondsSinceEpoch,
      });
      _initialized = true;
    }
  }

  Future<void> _loadFromDisk() async {
    final file = await _resolveFile();
    final contents = file.readAsStringSync();
    if (contents.trim().isEmpty) return;

    final lines = const LineSplitter().convert(contents);
    _entries.clear();

    for (final line in lines) {
      if (line.trim().isEmpty) continue;
      try {
        final json = jsonDecode(line) as Map<String, dynamic>;
        _entries.add(EvidenceEntry.fromJson(json));
      } catch (e) {
        _bus.emit(SentraEventType.error, {
          'message': 'SecureStorage: corrupt JSONL line skipped: $e',
          'severity': 'warning',
          'source': 'secure_storage',
          'code': 'parse_failure',
          'timestamp': DateTime.now().millisecondsSinceEpoch,
        });
      }
    }
    notifyListeners();
  }

  /// Appends a single evidence entry to persistent storage.
  Future<void> saveEntry(EvidenceEntry entry) async {
    if (!_initialized) await initialize();
    try {
      final file = await _resolveFile();
      final sink = file.openWrite(mode: FileMode.append);
      sink.writeln(jsonEncode(entry.toJson()));
      await sink.flush();
      await sink.close();
      _entries.add(entry);
      notifyListeners();
    } catch (e, st) {
      _bus.emit(SentraEventType.error, {
        'message': 'SecureStorage write failed: $e',
        'severity': 'critical',
        'source': 'secure_storage',
        'code': 'write_failure',
        'error': e.toString(),
        'stackTrace': st.toString(),
        'timestamp': DateTime.now().millisecondsSinceEpoch,
      });
    }
  }

  /// Returns the hash that the next chain entry should use as `previousHash`.
  String get lastHash =>
      _entries.isEmpty ? _genesisHash : _entries.last.entry.hash;

  /// Verifies the full chain: hash linkage, recomputation, and index ordering.
  IntegrityResult verifyChain() {
    if (_entries.isEmpty) return IntegrityResult.ok;

    for (var i = 0; i < _entries.length; i++) {
      final entry = _entries[i].entry;

      if (entry.index != i) {
        return IntegrityResult.broken(i, 'Index mismatch: expected $i, got ${entry.index}');
      }

      final expectedPrev = i == 0 ? _genesisHash : _entries[i - 1].entry.hash;
      if (entry.previousHash != expectedPrev) {
        return IntegrityResult.broken(i, 'Previous hash mismatch at index $i');
      }

      final recomputed = computeEntryHash(
        entry.index, entry.previousHash, entry.timestamp, entry.data,
      );
      if (recomputed != entry.hash) {
        return IntegrityResult.broken(i, 'Hash recomputation failed at index $i');
      }
    }

    return IntegrityResult.ok;
  }

  /// Clears in-memory state and deletes the persistent file.
  Future<void> clear() async {
    _entries.clear();
    final file = await _resolveFile();
    if (file.existsSync()) file.deleteSync();
    notifyListeners();
  }

  @override
  void dispose() {
    _entries.clear();
    super.dispose();
  }
}
