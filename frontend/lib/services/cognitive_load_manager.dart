import 'dart:async';
import 'dart:collection';

import 'package:flutter/foundation.dart';

import '../models/navigation_payloads.dart';
import 'event_bus.dart';

/// Cognitive load level reported by [CognitiveLoadManager].
enum CognitiveLoadLevel {
  /// Normal operation — full verbosity, all alerts active.
  normal,

  /// Elevated stress — secondary descriptions suppressed, rate +10%.
  elevated,

  /// Critical overload — streamlined mode, only imminent frontal obstacles.
  critical,
}

/// Monitors the frequency of alert and haptic events over a sliding window
/// and dynamically adjusts the TTS verbosity profile to prevent sensory
/// fatigue for blind users navigating high-stimulus environments.
///
/// When the alert rate in the last 10 seconds exceeds the critical threshold,
/// the manager switches to [CognitiveLoadLevel.critical] (streamlined mode):
/// only imminent frontal obstacles are spoken, secondary descriptions are
/// silenced, and the TTS rate is increased to deliver warnings faster.
class CognitiveLoadManager extends ChangeNotifier {
  final SentraEventBus _bus;

  /// Alert events per 10-second window that triggers each load level.
  final double elevatedThreshold;
  final double criticalThreshold;

  final Queue<int> _alertTimestamps = Queue<int>();
  StreamSubscription<SentraEvent>? _alertSub;
  StreamSubscription<SentraEvent>? _hapticSub;

  CognitiveLoadLevel _level = CognitiveLoadLevel.normal;
  double _ttsRateMultiplier = 1.0;
  bool _streamlinedMode = false;

  static const Duration _window = Duration(seconds: 10);

  CognitiveLoadManager({
    SentraEventBus? bus,
    this.elevatedThreshold = 8,
    this.criticalThreshold = 15,
  }) : _bus = bus ?? EventBusProvider.instance;

  CognitiveLoadLevel get level => _level;
  double get ttsRateMultiplier => _ttsRateMultiplier;
  bool get isStreamlinedMode => _streamlinedMode;

  /// Whether secondary scene descriptions should be spoken.
  bool get shouldSpeakSecondary => !_streamlinedMode;

  /// Whether a given obstacle alert should pass through in streamlined mode.
  /// Only imminent frontal obstacles (distance <= 0.8m) are spoken.
  bool shouldSpeakObstacle(double distanceMeters, String relativePosition) {
    if (!_streamlinedMode) return true;
    if (distanceMeters > 0.8) return false;
    final pos = relativePosition.toLowerCase();
    return pos.contains('front') || pos.contains('centro') || pos.isEmpty;
  }

  void start() {
    _alertSub = _bus.on(SentraEventType.cameraFrame).listen(_handleCameraFrame);
    _hapticSub = _bus.on(SentraEventType.haptic).listen(_handleHaptic);
  }

  void stop() {
    _alertSub?.cancel();
    _hapticSub?.cancel();
    _alertSub = null;
    _hapticSub = null;
  }

  void _handleCameraFrame(SentraEvent event) {
    final payload = CameraFramePayload.fromJson(
      Map<String, dynamic>.from(event.payload),
    );
    if (payload.obstacleProximity && payload.estimatedDistanceMeters > 0) {
      _recordAlert(event.timestamp);
    }
  }

  void _handleHaptic(SentraEvent event) {
    final payload = HapticPayload.fromJson(
      Map<String, dynamic>.from(event.payload),
    );
    if (payload.intensity == HapticIntensity.critical ||
        payload.intensity == HapticIntensity.strong) {
      _recordAlert(event.timestamp);
    }
  }

  void _recordAlert(int timestamp) {
    _alertTimestamps.addLast(timestamp);
    _pruneOld(timestamp);
    _evaluateLoad(timestamp);
  }

  void _pruneOld(int now) {
    final cutoff = now - _window.inMilliseconds;
    while (_alertTimestamps.isNotEmpty && _alertTimestamps.first < cutoff) {
      _alertTimestamps.removeFirst();
    }
  }

  void _evaluateLoad(int timestamp) {
    _pruneOld(timestamp);
    final count = _alertTimestamps.length;
    final newLevel = _levelFor(count);

    if (newLevel != _level) {
      _level = newLevel;
      _applyLevel(newLevel);
      _bus.emit('cognitive_load', {
        'level': newLevel.name,
        'alertCount': count,
        'streamlined': _streamlinedMode,
        'ttsRateMultiplier': _ttsRateMultiplier,
        'timestamp': timestamp,
      });
      notifyListeners();
    }
  }

  CognitiveLoadLevel _levelFor(int count) {
    if (count >= criticalThreshold) return CognitiveLoadLevel.critical;
    if (count >= elevatedThreshold) return CognitiveLoadLevel.elevated;
    return CognitiveLoadLevel.normal;
  }

  void _applyLevel(CognitiveLoadLevel level) {
    switch (level) {
      case CognitiveLoadLevel.normal:
        _ttsRateMultiplier = 1.0;
        _streamlinedMode = false;
      case CognitiveLoadLevel.elevated:
        _ttsRateMultiplier = 1.1;
        _streamlinedMode = false;
      case CognitiveLoadLevel.critical:
        _ttsRateMultiplier = 1.3;
        _streamlinedMode = true;
    }
  }

  /// Forces a re-evaluation of the current load based on the clock.
  void refresh() {
    final now = DateTime.now().millisecondsSinceEpoch;
    _evaluateLoad(now);
  }

  /// Resets the manager to normal state and clears the alert history.
  void reset() {
    _alertTimestamps.clear();
    _level = CognitiveLoadLevel.normal;
    _ttsRateMultiplier = 1.0;
    _streamlinedMode = false;
    notifyListeners();
  }

  int get currentAlertCount => _alertTimestamps.length;

  @override
  void dispose() {
    stop();
    _alertTimestamps.clear();
    super.dispose();
  }
}
