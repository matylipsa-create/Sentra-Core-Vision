import 'dart:convert';
import 'dart:io';

import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';

import '../models/evidence_entry.dart';
import 'event_bus.dart';
import 'secure_storage_service.dart';

const _genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';

/// Snapshot of the EVOLIS chain ready for air-gapped transfer.
class AirGapExport {
  final String formatVersion;
  final int exportedAt;
  final int entryCount;
  final String chainHash;
  final List<EvidenceEntry> entries;

  const AirGapExport({
    required this.formatVersion,
    required this.exportedAt,
    required this.entryCount,
    required this.chainHash,
    required this.entries,
  });

  Map<String, dynamic> toJson() => {
        'formatVersion': formatVersion,
        'exportedAt': exportedAt,
        'entryCount': entryCount,
        'chainHash': chainHash,
        'entries': entries.map((e) => e.toJson()).toList(),
      };

  String toJsonString() => jsonEncode(toJson());

  factory AirGapExport.fromJson(Map<String, dynamic> json) {
    return AirGapExport(
      formatVersion: json['formatVersion'] as String? ?? '1.0',
      exportedAt: json['exportedAt'] as int? ?? 0,
      entryCount: json['entryCount'] as int? ?? 0,
      chainHash: json['chainHash'] as String? ?? '',
      entries: (json['entries'] as List?)
              ?.map((e) => EvidenceEntry.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

/// Air-gapped export and import service for the EVOLIS evidence chain.
///
/// Packages the current chain state into a structured JSON payload that can be
/// shared via local transfer mechanisms (Bluetooth, QR, file copy) without any
/// cloud dependency. Also supports writing the export to a file in the app's
/// documents directory and importing from a received payload.
class AirGapExportService extends ChangeNotifier {
  final SecureStorageService _storage;
  final SentraEventBus _bus;

  AirGapExportService({
    required SecureStorageService storage,
    SentraEventBus? bus,
  })  : _storage = storage,
        _bus = bus ?? EventBusProvider.instance;

  /// Builds an [AirGapExport] from the current in-memory chain.
  AirGapExport buildExport() {
    final entries = _storage.entries;
    final chainHash = _computeChainHash(entries);
    return AirGapExport(
      formatVersion: '1.0',
      exportedAt: DateTime.now().millisecondsSinceEpoch,
      entryCount: entries.length,
      chainHash: chainHash,
      entries: entries,
    );
  }

  /// Exports the chain as a compact JSON string suitable for QR or BLE transfer.
  String exportToJsonString() => buildExport().toJsonString();

  /// Writes the export to a timestamped file in the app's documents directory.
  /// Returns the file path.
  Future<String> exportToFile() async {
    final dir = await getApplicationDocumentsDirectory();
    final stamp = DateTime.now().toIso8601String().replaceAll(RegExp(r'[:.]'), '-');
    final path = '${dir.path}/evolis_export_$stamp.json';
    try {
      final file = File(path);
      final sink = file.openWrite();
      sink.write(exportToJsonString());
      await sink.flush();
      await sink.close();
      _bus.emit(SentraEventType.alertDispatch, {
        'status': 'exported',
        'path': path,
        'entryCount': _storage.entryCount,
      });
      return path;
    } catch (e, st) {
      _bus.emit(SentraEventType.error, {
        'message': 'Air-gap export to file failed: $e',
        'severity': 'critical',
        'source': 'air_gap_export',
        'code': 'file_write_failure',
        'error': e.toString(),
        'stackTrace': st.toString(),
        'timestamp': DateTime.now().millisecondsSinceEpoch,
      });
      rethrow;
    }
  }

  /// Imports an [AirGapExport] from a JSON string, verifying integrity before
  /// merging entries that are not already present.
  /// Returns the number of new entries imported.
  Future<int> importFromJsonString(String jsonString) async {
    try {
      final json = jsonDecode(jsonString) as Map<String, dynamic>;
      final export = AirGapExport.fromJson(json);

      final result = _verifyImportedChain(export.entries);
      if (!result.valid) {
        _bus.emit(SentraEventType.error, {
          'message': 'Import rejected: ${result.reason}',
          'severity': 'critical',
          'source': 'air_gap_export',
          'code': 'integrity_check_failed',
          'timestamp': DateTime.now().millisecondsSinceEpoch,
        });
        return 0;
      }

      final existingIds = _storage.entries.map((e) => e.id).toSet();
      var newCount = 0;
      for (final entry in export.entries) {
        if (!existingIds.contains(entry.id)) {
          await _storage.saveEntry(entry);
          newCount++;
        }
      }
      notifyListeners();
      return newCount;
    } catch (e, st) {
      _bus.emit(SentraEventType.error, {
        'message': 'Air-gap import failed: $e',
        'severity': 'critical',
        'source': 'air_gap_export',
        'code': 'import_parse_failure',
        'error': e.toString(),
        'stackTrace': st.toString(),
        'timestamp': DateTime.now().millisecondsSinceEpoch,
      });
      return 0;
    }
  }

  String _computeChainHash(List<EvidenceEntry> entries) {
    if (entries.isEmpty) return _genesisHash;
    final concat = entries.map((e) => e.entry.hash).join('|');
    return sha256.convert(utf8.encode(concat)).toString();
  }

  IntegrityResult _verifyImportedChain(List<EvidenceEntry> entries) {
    if (entries.isEmpty) return IntegrityResult.ok;

    for (var i = 0; i < entries.length; i++) {
      final entry = entries[i].entry;

      if (entry.index != i) {
        return IntegrityResult.broken(i, 'Imported index mismatch at $i');
      }

      final expectedPrev =
          i == 0 ? _genesisHash : entries[i - 1].entry.hash;
      if (entry.previousHash != expectedPrev) {
        return IntegrityResult.broken(i, 'Imported previous hash mismatch at $i');
      }

      final recomputed = computeEntryHash(
        entry.index, entry.previousHash, entry.timestamp, entry.data,
      );
      if (recomputed != entry.hash) {
        return IntegrityResult.broken(i, 'Imported hash recomputation failed at $i');
      }
    }

    return IntegrityResult.ok;
  }
}
