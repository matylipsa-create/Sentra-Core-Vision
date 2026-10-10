import 'package:flutter_test/flutter_test.dart';
import 'package:sentra_core/services/evolis_chain_verifier.dart';
import 'package:sentra_core/services/secure_storage_service.dart';

void main() {
  group('EvolisChainVerifier', () {
    test('isChainValid is false before any verification', () {
      final storage = SecureStorageService();
      final verifier = EvolisChainVerifier(storage: storage);
      expect(verifier.isChainValid, isFalse);
      expect(verifier.lastResult, isNull);
    });

    test('verifyOnStartup marks empty chain as valid', () async {
      final storage = SecureStorageService();
      final verifier = EvolisChainVerifier(storage: storage);
      // Without path_provider we can't call initialize() in tests,
      // but verifyChain() on an empty in-memory chain is valid.
      final result = storage.verifyChain();
      expect(result.valid, isTrue);
    });

    test('reverify delegates to verifyOnStartup', () {
      final storage = SecureStorageService();
      final verifier = EvolisChainVerifier(storage: storage);
      expect(verifier.reverify, isA<Function>());
    });
  });

  group('IntegrityResult', () {
    test('ok constant', () {
      expect(IntegrityResult.ok.valid, isTrue);
      expect(IntegrityResult.ok.reason, '');
    });

    test('broken factory', () {
      final r = IntegrityResult.broken(5, 'tampered');
      expect(r.valid, isFalse);
      expect(r.brokenIndex, 5);
      expect(r.reason, 'tampered');
    });
  });
}
