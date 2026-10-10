import 'dart:async';
import 'dart:collection';

import 'package:flutter/foundation.dart';

import 'event_bus.dart';
import '../models/navigation_payloads.dart';

/// Severity tier for a mitigation decision.
enum MitigationSeverity { low, medium, critical }

/// Decision produced by the [SensorMitigationEngine] after filtering and
/// grouping raw proximity events.
class MitigationDecision {
  final MitigationSeverity severity;
  final HapticIntensity hapticIntensity;
  final List<int> hapticPattern;
  final String reason;
  final double distanceMeters;
  final int timestamp;

  const MitigationDecision({
    required this.severity,
    required this.hapticIntensity,
    required this.hapticPattern,
    required this.reason,
    required this.distanceMeters,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
        'severity': severity.name,
        'hapticIntensity': hapticIntensity.name,
        'hapticPattern': hapticPattern,
        'reason': reason,
        'distanceMeters': distanceMeters,
        'timestamp': timestamp,
      };
}

/// Multi-layer sensor mitigation engine that filters micro-vibrations and
/// groups rapid alert bursts into clean, differentiated haptic pulses.
///
/// Inspired by Active Rejection Systems (ARS), it applies three layers:
/// 1. **Noise floor**: discards proximity events with distance > noiseFloorM.
/// 2. **Debounce**: suppresses repeated alerts within debounceMs of the last
///    emitted pulse, collapsing bursts into a single signal.
/// 3. **Severity routing**: maps the smoothed distance to a severity tier
///    (low / medium / critical) with a distinct haptic pattern per tier.
class SensorMitigationEngine extends ChangeNotifier {
  final SentraEventBus _bus;

  final double noiseFloorM;
  final int debounceMs;
  final double mediumThresholdM;
  final double criticalThresholdM;

  final Queue<double> _proximityBuffer = Queue<double>();
  static const int _bufferCapacity = 5;

  int _lastEmitTimestamp = 0;
  MitigationDecision? _lastDecision;
  int _suppressedCount = 0;

  StreamSubscription<SentraEvent>? _cameraSub;

  SensorMitigationEngine({
    SentraEventBus? bus,
    this.noiseFloorM = 3.0,
    this.debounceMs = 400,
    this.mediumThresholdM = 1.5,
    this.criticalThresholdM = 0.5,
  }) : _bus = bus ?? EventBusProvider.instance;

  MitigationDecision? get lastDecision => _lastDecision;
  int get suppressedCount => _suppressedCount;

  void start() {
    _cameraSub = _bus.on(SentraEventType.cameraFrame).listen(_handleCameraFrame);
  }

  void stop() {
    _cameraSub?.cancel();
    _cameraSub = null;
  }

  void _handleCameraFrame(SentraEvent event) {
    final payload = CameraFramePayload.fromJson(
      Map<String, dynamic>.from(event.payload),
    );
    if (!payload.obstacleProximity) return;
    if (payload.estimatedDistanceMeters < 0) return;

    final decision = process(
      payload.estimatedDistanceMeters,
      event.timestamp,
    );
    if (decision != null) {
      _emitDecision(decision);
    }
  }

  /// Processes a raw proximity reading and returns a [MitigationDecision] if
  /// the event passes all filter layers, or null if it was suppressed.
  MitigationDecision? process(double distanceMeters, int timestamp) {
    // Layer 1: noise floor
    if (distanceMeters > noiseFloorM) {
      _suppressedCount++;
      return null;
    }

    // Buffer the reading for median smoothing
    _pushProximity(distanceMeters);
    final smoothed = _medianDistance();

    // Layer 2: debounce
    if (timestamp - _lastEmitTimestamp < debounceMs) {
      _suppressedCount++;
      return null;
    }

    // Layer 3: severity routing
    final severity = _severityFor(smoothed);
    final intensity = _intensityForSeverity(severity);
    final pattern = _patternForSeverity(severity);

    final decision = MitigationDecision(
      severity: severity,
      hapticIntensity: intensity,
      hapticPattern: pattern,
      reason: 'proximity_mitigated',
      distanceMeters: smoothed,
      timestamp: timestamp,
    );

    _lastEmitTimestamp = timestamp;
    _lastDecision = decision;
    notifyListeners();
    return decision;
  }

  void _emitDecision(MitigationDecision decision) {
    _bus.emit(SentraEventType.haptic, {
      'intensity': decision.hapticIntensity.name,
      'pattern': decision.hapticPattern,
      'reason': decision.reason,
    });

    _bus.emit('mitigation_decision', decision.toJson());
  }

  void _pushProximity(double distance) {
    _proximityBuffer.addLast(distance);
    while (_proximityBuffer.length > _bufferCapacity) {
      _proximityBuffer.removeFirst();
    }
  }

  double _medianDistance() {
    if (_proximityBuffer.isEmpty) return double.infinity;
    final sorted = _proximityBuffer.toList()..sort();
    return sorted[sorted.length ~/ 2];
  }

  MitigationSeverity _severityFor(double distance) {
    if (distance <= criticalThresholdM) return MitigationSeverity.critical;
    if (distance <= mediumThresholdM) return MitigationSeverity.medium;
    return MitigationSeverity.low;
  }

  HapticIntensity _intensityForSeverity(MitigationSeverity severity) {
    switch (severity) {
      case MitigationSeverity.low:
        return HapticIntensity.light;
      case MitigationSeverity.medium:
        return HapticIntensity.strong;
      case MitigationSeverity.critical:
        return HapticIntensity.critical;
    }
  }

  List<int> _patternForSeverity(MitigationSeverity severity) {
    switch (severity) {
      case MitigationSeverity.low:
        return const [200];
      case MitigationSeverity.medium:
        return const [300, 100, 300];
      case MitigationSeverity.critical:
        return const [500, 100, 500, 100, 500];
    }
  }

  void reset() {
    _proximityBuffer.clear();
    _lastEmitTimestamp = 0;
    _lastDecision = null;
    _suppressedCount = 0;
    notifyListeners();
  }

  void dispose() {
    stop();
    _proximityBuffer.clear();
  }
}
