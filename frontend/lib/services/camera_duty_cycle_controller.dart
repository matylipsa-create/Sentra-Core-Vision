import 'dart:async';
import 'dart:collection';

import '../locator.dart';
import '../models/navigation_payloads.dart';
import 'event_bus.dart';

/// Camera duty cycle controller with LOD-inspired throttling.
///
/// - Normal mode (obstacle > 1.5 m): 2-5 FPS to conserve battery.
/// - Alert mode (obstacle <= 1.5 m): scales toward max FPS and triggers
///   high-intensity haptic feedback that increases as distance shrinks.
///
/// A circular buffer smooths distance readings to suppress false positives.
/// Emits JSON `camera_frame` and `haptic` events on the bus.
class CameraDutyCycleController {
  final SentraEventBus _bus;
  final IHapticService _haptic;

  final double _minFps;
  final double _maxFps;
  final double _alertMaxFps;
  final double _proximityThresholdM;
  final int _bufferSize;

  final Queue<double> _distanceBuffer = Queue<double>();
  Timer? _cycleTimer;
  int _frameCounter = 0;
  bool _running = false;
  double _currentFps;

  CameraDutyCycleController({
    SentraEventBus? bus,
    IHapticService? haptic,
    double minFps = 2,
    double maxFps = 5,
    double alertMaxFps = 10,
    double proximityThresholdM = 1.5,
    int bufferSize = 5,
  })  : _bus = bus ?? EventBusProvider.instance,
        _haptic = haptic ?? ServiceLocator.haptic,
        _minFps = minFps,
        _maxFps = maxFps,
        _alertMaxFps = alertMaxFps,
        _proximityThresholdM = proximityThresholdM,
        _bufferSize = bufferSize,
        _currentFps = minFps;

  double get currentFps => _currentFps;
  bool get isRunning => _running;
  double get smoothedDistance => _smoothedDistance();

  void start(FutureOr<double> Function(int frameId) frameCallback) {
    if (_running) return;
    _running = true;
    _scheduleNext(frameCallback);
  }

  void stop() {
    _running = false;
    _cycleTimer?.cancel();
    _cycleTimer = null;
  }

  void dispose() {
    stop();
    _distanceBuffer.clear();
  }

  void _scheduleNext(FutureOr<double> Function(int frameId) frameCallback) {
    if (!_running) return;
    final intervalMs = (1000 / _currentFps).round();
    _cycleTimer = Timer(Duration(milliseconds: intervalMs), () async {
      final frameId = _frameCounter++;
      double distance;
      try {
        distance = await frameCallback(frameId);
      } catch (_) {
        distance = double.infinity;
      }
      _processFrame(frameId, distance);
      _scheduleNext(frameCallback);
    });
  }

  void _processFrame(int frameId, double rawDistance) {
    _pushDistance(rawDistance);
    final smoothed = _smoothedDistance();
    final obstacleClose = smoothed <= _proximityThresholdM;

    if (obstacleClose) {
      _currentFps = _lerp(_maxFps, _alertMaxFps, _proximityFactor(smoothed));
      _emitHaptic(smoothed);
    } else {
      _currentFps = _lerp(_minFps, _maxFps, _normalFactor(smoothed));
    }

    final now = DateTime.now().millisecondsSinceEpoch;
    _bus.emit(
      SentraEventType.cameraFrame,
      CameraFramePayload(
        frameId: frameId,
        fps: _currentFps,
        obstacleProximity: obstacleClose,
        estimatedDistanceMeters: smoothed.isFinite ? smoothed : -1,
        detections: const [],
        timestamp: now,
      ).toJson(),
      now,
    );
  }

  void _pushDistance(double distance) {
    _distanceBuffer.addLast(distance);
    while (_distanceBuffer.length > _bufferSize) {
      _distanceBuffer.removeFirst();
    }
  }

  double _smoothedDistance() {
    if (_distanceBuffer.isEmpty) return double.infinity;
    final sorted = _distanceBuffer.toList()..sort();
    return sorted[sorted.length ~/ 2];
  }

  double _proximityFactor(double distance) {
    if (distance <= 0) return 1;
    final factor = 1 - (distance / _proximityThresholdM);
    return factor.clamp(0.0, 1.0);
  }

  double _normalFactor(double distance) {
    if (distance.isInfinite) return 0;
    const farBound = 5.0;
    if (distance >= farBound) return 0;
    return (1 - (distance - _proximityThresholdM) /
            (farBound - _proximityThresholdM))
        .clamp(0.0, 1.0);
  }

  double _lerp(double a, double b, double t) => a + (b - a) * t;

  void _emitHaptic(double distance) {
    final factor = _proximityFactor(distance);
    final intensity = _intensityForFactor(factor);
    final pattern = _hapticPattern(intensity);

    if (intensity == HapticIntensity.critical) {
      _haptic.heavyImpact();
    } else if (intensity == HapticIntensity.strong) {
      _haptic.mediumImpact();
    } else {
      _haptic.lightImpact();
    }

    _bus.emit(
      SentraEventType.haptic,
      HapticPayload(
        intensity: intensity,
        pattern: pattern,
        reason: 'obstacle_proximity',
      ).toJson(),
    );
  }

  HapticIntensity _intensityForFactor(double factor) {
    if (factor >= 0.8) return HapticIntensity.critical;
    if (factor >= 0.5) return HapticIntensity.strong;
    if (factor >= 0.25) return HapticIntensity.medium;
    return HapticIntensity.light;
  }

  List<int> _hapticPattern(HapticIntensity intensity) {
    switch (intensity) {
      case HapticIntensity.light:
        return const [200];
      case HapticIntensity.medium:
        return const [200, 100, 200];
      case HapticIntensity.strong:
        return const [300, 100, 300, 100, 300];
      case HapticIntensity.critical:
        return const [500, 100, 500, 100, 500, 100, 500];
    }
  }
}
