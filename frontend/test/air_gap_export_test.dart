import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:sentra_core/models/evidence_entry.dart';
import 'package:sentra_core/services/air_gap_export_service.dart';
import 'package:sentra_core/services/secure_storage_service.dart';

void main() {
  group('AirGapExport', () {
    test('toJson and fromJson roundtrip', () {
      final export = AirGapExport(
        formatVersion: '1.0',
        exportedAt: 1700000000,
        entryCount: 1,
        chainHash: 'abc',
        entries: [
          EvidenceEntry(
            id: 'e1',
            entry: HashChainEntry(
              index: 0,
              hash: 'h0',
              previousHash: 'genesis',
              timestamp: 1000,
              data: 'test',
            ),
            module: 'vision',
            action: 'detect',
          ),
        ],
      );

      final json = export.toJson();
      final restored = AirGapExport.fromJson(json);

      expect(restored.formatVersion, '1.0');
      expect(restored.exportedAt, 1700000000);
      expect(restored.entryCount, 1);
      expect(restored.chainHash, 'abc');
      expect(restored.entries.length, 1);
      expect(restored.entries.first.id, 'e1');
      expect(restored.entries.first.entry.index, 0);
    });

    test('toJsonString produces valid JSON', () {
      final export = AirGapExport(
        formatVersion: '1.0',
        exportedAt: 100,
        entryCount: 0,
        chainHash: '',
        entries: const [],
      );
      final str = export.toJsonString();
      final decoded = jsonDecode(str) as Map<String, dynamic>;
      expect(decoded['formatVersion'], '1.0');
      expect(decoded['entryCount'], 0);
    });

    test('fromJson handles empty entries list', () {
      final restored = AirGapExport.fromJson({});
      expect(restored.entries, isEmpty);
      expect(restored.entryCount, 0);
    });
  });

  group('AirGapExportService buildExport', () {
    test('empty storage produces empty export', () {
      final storage = SecureStorageService();
      final svc = AirGapExportService(storage: storage);
      final export = svc.buildExport();

      expect(export.formatVersion, '1.0');
      expect(export.entries, isEmpty);
      expect(export.entryCount, 0);
      // chainHash for empty chain should be genesis
      expect(export.chainHash, genesisHash);
    });

    test('exportToJsonString returns parseable JSON', () {
      final storage = SecureStorageService();
      final svc = AirGapExportService(storage: storage);
      final str = svc.exportToJsonString();

      final decoded = jsonDecode(str) as Map<String, dynamic>;
      expect(decoded['formatVersion'], '1.0');
      expect(decoded['entries'], isA<List>());
    });
  });
}

const genesisHash =
    '0000000000000000000000000000000000000000000000000000000000000000';
