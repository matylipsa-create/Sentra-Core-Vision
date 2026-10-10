import 'dart:async';

import 'package:flutter/foundation.dart';

import 'event_bus.dart';
import 'secure_storage_service.dart';

/// Startup integrity verifier for the EVOLIS evidence chain.
///
/// On app launch, [verifyOnStartup] loads the persisted chain from
/// [SecureStorageService] and runs a full hash-chain verification. If the
/// chain is broken or tampered, a critical error event is emitted on the bus
/// and the [lastResult] is updated for UI consumption.
class EvolisChainVerifier extends ChangeNotifier {
  final SecureStorageService _storage;
  final SentraEventBus _bus;

  IntegrityResult? _lastResult;
  bool _verifying = false;

  EvolisChainVerifier({
    required SecureStorageService storage,
    SentraEventBus? bus,
  })  : _storage = storage,
        _bus = bus ?? EventBusProvider.instance;

  IntegrityResult? get lastResult => _lastResult;
  bool get isVerifying => _verifying;
  bool get isChainValid => _lastResult?.valid ?? false;

  /// Runs the startup verification sequence.
  ///
  /// Ensures storage is initialized, then verifies the full chain. Emits
  /// a critical error event if the chain is broken.
  Future<IntegrityResult> verifyOnStartup() async {
    if (_verifying) return _lastResult ?? IntegrityResult.ok;

    _verifying = true;
    notifyListeners();

    try {
      await _storage.initialize();
      final result = _storage.verifyChain();
      _lastResult = result;

      if (!result.valid) {
        _bus.emit(SentraEventType.error, {
          'message': 'EVOLIS chain integrity breach: ${result.reason}',
          'severity': 'critical',
          'source': 'evolis_verifier',
          'code': 'chain_tampered',
          'brokenIndex': result.brokenIndex,
          'timestamp': DateTime.now().millisecondsSinceEpoch,
        });
      }

      return result;
    } catch (e, st) {
      _lastResult = IntegrityResult(
        valid: false,
        reason: 'Verification error: $e',
      );
      _bus.emit(SentraEventType.error, {
        'message': 'EVOLIS verification error: $e',
        'severity': 'critical',
        'source': 'evolis_verifier',
        'code': 'verification_error',
        'error': e.toString(),
        'stackTrace': st.toString(),
        'timestamp': DateTime.now().millisecondsSinceEpoch,
      });
      return _lastResult!;
    } finally {
      _verifying = false;
      notifyListeners();
    }
  }

  /// Re-runs verification on demand (e.g. after an import).
  Future<IntegrityResult> reverify() => verifyOnStartup();
}
