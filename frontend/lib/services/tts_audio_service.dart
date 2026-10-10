import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';

import '../models/navigation_payloads.dart';
import 'event_bus.dart';

/// Adaptive text-to-speech service for accessibility feedback.
///
/// Configured for Spanish (es-AR) with a base speech rate of 0.5 for clarity,
/// full volume, and pitch 1.0. Implements priority-based interruption:
/// [TtsPriority.critical] alerts cancel any current speech before speaking,
/// while lower-priority messages queue or are dropped if a critical message
/// is already in progress.
///
/// Reactively listens to the [SentraEventBus] for:
/// - [TtsEvent] — speaks the payload text at the requested rate/priority.
/// - [MindStateChangedEvent] — announces breach distortion automatically.
/// - [CameraFrameEvent] — speaks proximity warnings when obstacles are close.
class TtsAudioService extends ChangeNotifier {
  final SentraEventBus _bus;
  final FlutterTts _tts = FlutterTts();

  final EventSubscriptions _subs = EventSubscriptions();
  bool _initialized = false;
  bool _speaking = false;
  TtsPriority? _currentPriority;

  static const double _baseRate = 0.5;
  static const double _baseVolume = 1.0;
  static const double _basePitch = 1.0;

  TtsAudioService({SentraEventBus? bus})
      : _bus = bus ?? EventBusProvider.instance;

  bool get isSpeaking => _speaking;
  bool get isInitialized => _initialized;

  /// Initializes the TTS engine and starts listening to bus events.
  Future<void> start() async {
    if (_initialized) return;
    _initialized = true;

    await _tts.setLanguage('es-AR');
    await _tts.setSpeechRate(_baseRate);
    await _tts.setVolume(_baseVolume);
    await _tts.setPitch(_basePitch);

    _tts.setStartHandler(() {
      _speaking = true;
      notifyListeners();
    });
    _tts.setCompletionHandler(() {
      _speaking = false;
      _currentPriority = null;
      notifyListeners();
    });
    _tts.setErrorHandler((_) {
      _speaking = false;
      _currentPriority = null;
      notifyListeners();
    });

    _subs.add(_bus.on<TtsEvent>().listen(_handleTtsEvent));
    _subs.add(_bus.on<MindStateChangedEvent>().listen(_handleMindStateEvent));
    _subs.add(_bus.on<CameraFrameEvent>().listen(_handleCameraFrameEvent));
  }

  /// Stops any current speech and cancels the queue.
  Future<void> stop() async {
    await _tts.stop();
    _speaking = false;
    _currentPriority = null;
    notifyListeners();
  }

  /// Speaks [text] at the given [priority] and optional [rate] override.
  ///
  /// Critical-priority messages interrupt any ongoing speech. Normal-priority
  /// messages are skipped if a critical message is in progress. Low-priority
  /// messages are skipped if any other message is in progress.
  Future<void> speak(
    String text, {
    TtsPriority priority = TtsPriority.normal,
    double? rate,
  }) async {
    if (!_initialized) return;

    if (_speaking) {
      final shouldInterrupt = _shouldInterrupt(_currentPriority, priority);
      if (!shouldInterrupt) return;
      await _tts.stop();
      _speaking = false;
    }

    _currentPriority = priority;
    final effectiveRate = rate ?? _baseRate;
    await _tts.setSpeechRate(effectiveRate);
    await _tts.speak(text);
  }

  bool _shouldInterrupt(TtsPriority? current, TtsPriority incoming) {
    if (current == null) return true;
    if (incoming == TtsPriority.critical) return true;
    if (incoming == TtsPriority.normal && current == TtsPriority.low) {
      return true;
    }
    return false;
  }

  void _handleTtsEvent(TtsEvent event) {
    final payload = event.payload;
    speak(payload.text, priority: payload.priority, rate: payload.rate);
  }

  void _handleMindStateEvent(MindStateChangedEvent event) {
    if (event.stateMode == 'IMAGINARY_NUMBER') {
      speak(
        'Alerta: percepción distorsionada. Modo números imaginarios activado. '
        'Compensación háptica y de voz aumentada.',
        priority: TtsPriority.critical,
      );
    } else if (event.stability > 40.0) {
      speak(
        'Percepción estabilizada. Modo números reales restaurado.',
        priority: TtsPriority.normal,
      );
    }
  }

  void _handleCameraFrameEvent(CameraFrameEvent event) {
    final payload = event.payload;
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

  Future<void> dispose() async {
    await _subs.cancelAll();
    await _tts.stop();
    _initialized = false;
  }
}
