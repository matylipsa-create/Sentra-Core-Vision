import 'dart:async';

import 'package:flutter/foundation.dart';

import '../models/operator_mind_state.dart';
import 'event_bus.dart';
import 'supabase_tactical_client.dart';

/// Manages the operator's mental stability state and persists it to Supabase.
///
/// Publishes [MindStateChangedEvent] on the event bus whenever stability
/// changes, so the haptic and TTS accessibility layers can compensate for
/// distorted perception modes.
class OperatorMindManager extends ChangeNotifier {
  final SentraEventBus _bus;
  final SupabaseTacticalClient _client;

  OperatorMindState _state;
  bool _isLoading = false;

  OperatorMindManager({
    SentraEventBus? bus,
    SupabaseTacticalClient? client,
  })  : _bus = bus ?? EventBusProvider.instance,
        _client = client ?? SupabaseTacticalClient(),
        _state = const OperatorMindState();

  OperatorMindState get state => _state;
  bool get isLoading => _isLoading;

  /// Loads the persisted state from Supabase (or initializes a fresh row).
  Future<void> loadState() async {
    _isLoading = true;
    notifyListeners();
    try {
      final rows = await _client.select('operator_mind_state');
      if (rows.isNotEmpty) {
        _state = OperatorMindState.fromJson(rows.first);
      } else {
        await _client.insert('operator_mind_state', _state.toJson());
      }
    } catch (_) {
      // Supabase not reachable — continue with default state.
    }
    _isLoading = false;
    notifyListeners();
  }

  /// Applies breach exposure and persists the new state.
  Future<void> applyBreachExposure(double exposure) async {
    _state = _state.applyBreachExposure(exposure);
    notifyListeners();
    _publishChange();
    await _persist();
  }

  /// Recovers stability and persists the new state.
  Future<void> recover(double amount) async {
    _state = _state.recover(amount);
    notifyListeners();
    _publishChange();
    await _persist();
  }

  /// Resets to full stability (e.g. after rest).
  Future<void> reset() async {
    _state = const OperatorMindState(
      stability: 100.0,
      stateMode: MindStateMode.realNumber,
      breachExposure: 0.0,
    );
    notifyListeners();
    _publishChange();
    await _persist();
  }

  void _publishChange() {
    _bus.publishWithClock((ts) => MindStateChangedEvent(
          _state.stability,
          _state.stateMode == MindStateMode.imaginaryNumber
              ? 'IMAGINARY_NUMBER'
              : 'REAL_NUMBER',
          _state.breachExposure,
          ts,
        ));
  }

  Future<void> _persist() async {
    try {
      await _client.update(
        'operator_mind_state',
        {
          'stability': _state.stability,
          'state_mode': _state.stateMode == MindStateMode.imaginaryNumber
              ? 'IMAGINARY_NUMBER'
              : 'REAL_NUMBER',
          'breach_exposure': _state.breachExposure,
          'updated_at': DateTime.now().toIso8601String(),
        },
        'id=eq.1',
      );
    } catch (_) {
      // Offline — state remains in-memory until next sync.
    }
  }
}
