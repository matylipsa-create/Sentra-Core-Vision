import 'dart:async';

import 'package:flutter/foundation.dart';

import '../interfaces/hardware_interfaces.dart';
import '../locator.dart';
import '../models/navigation_payloads.dart';
import 'event_bus.dart';

/// Adaptive text-to-speech service for accessibility feedback.
///
/// Delegates all native TTS calls to the [ITtsService] adapter registered
/// in [ServiceLocator], making it fully platform-agnostic. Configured for
/// Spanish (es-AR) with a base speech rate of 0.5 for clarity, full volume,
/// and pitch 1.0. Implements priority-based interruption:
/// [TtsPriority.critical] alerts cancel any current speech before speaking,
/// while lower-priority messages queue or are dropped if a critical message
/// is already in progress.
///
/// Reactively listens to the [SentraEventBus] for:
/// - `tts` events — speaks the payload text at the requested rate/priority.
/// - `camera_frame` events — speaks proximity warnings when obstacles are close.
class TtsAudioService extends ChangeNotifier {
  final SentraEventBus _bus;
  final ITtsService _engine;

  final EventSubscriptions _subs = EventSubscriptions();
  bool _initialized = false;
  bool _speaking = false;
  TtsPriority? _currentPriority;

  static const double _baseRate = 0.5;
  static const double _baseVolume = 1.0;
  static const double _basePitch = 1.0;

  TtsAudioService({SentraEventBus? bus, ITtsService? engine})
      : _bus = bus ?? EventBusProvider.instance,
        _engine = engine ?? ServiceLocator.tts;

  bool get isSpeaking => _speaking;
  bool get isInitialized => _initialized;

  Future<void> start() async {
    if (_initialized) return;
    _initialized = true;

    await _engine.initialize();
    await _engine.setLanguage('es-AR');
    await _engine.setSpeechRate(_baseRate);
    await _engine.setVolume(_baseVolume);
    await _engine.setPitch(_basePitch);

    _engine.setStartHandler(() {
      _speaking = true;
      notifyListeners();
    });
    _engine.setCompletionHandler(() {
      _speaking = false;
      _currentPriority = null;
      notifyListeners();
    });
    _engine.setErrorHandler((_) {
      _speaking = false;
      _currentPriority = null;
      notifyListeners();
    });

    _subs.add(_bus.on(SentraEventType.tts).listen(_handleTtsEvent));
    _subs.add(
        _bus.on(SentraEventType.cameraFrame).listen(_handleCameraFrameEvent));
  }

  Future<void> stop() async {
    await _engine.stop();
    _speaking = false;
    _currentPriority = null;
    notifyListeners();
  }

  Future<void> speak(
    String text, {
    TtsPriority priority = TtsPriority.normal,
    double? rate,
  }) async {
    if (!_initialized) return;

    if (_speaking) {
      final shouldInterrupt = _shouldInterrupt(_currentPriority, priority);
      if (!shouldInterrupt) return;
      await _engine.stop();
      _speaking = false;
    }

    _currentPriority = priority;
    final effectiveRate = rate ?? _baseRate;
    await _engine.setSpeechRate(effectiveRate);
    await _engine.speak(text);
  }

  bool _shouldInterrupt(TtsPriority? current, TtsPriority incoming) {
    if (current == null) return true;
    if (incoming == TtsPriority.critical) return true;
    if (incoming == TtsPriority.normal && current == TtsPriority.low) {
      return true;
    }
    return false;
  }

  void _handleTtsEvent(SentraEvent event) {
    final payload = TtsPayload.fromJson(
      Map<String, dynamic>.from(event.payload),
    );
    speak(payload.text, priority: payload.priority, rate: payload.rate);
  }

  void _handleCameraFrameEvent(SentraEvent event) {
    final payload = CameraFramePayload.fromJson(
      Map<String, dynamic>.from(event.payload),
    );
    if (!payload.obstacleProximity) return;
    if (payload.estimatedDistanceMeters < 0) return;

    final distance = payload.estimatedDistanceMeters;
    final priority = distance <= 0.5
        ? TtsPriority.critical
        : TtsPriority.normal;

    speak(
      'Obstáculo a ${distance.toStringAsFixed(1)} metros.',
      priority: priority,
    );
  }

  @override
  Future<void> dispose() async {
    await _subs.cancelAll();
    await _engine.dispose();
    _initialized = false;
    super.dispose();
  }
}
