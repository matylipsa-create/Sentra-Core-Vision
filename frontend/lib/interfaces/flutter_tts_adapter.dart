import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';

import 'hardware_interfaces.dart';

/// Android / iOS TTS adapter backed by [FlutterTts].
class FlutterTtsAdapter implements ITtsService {
  final FlutterTts _tts = FlutterTts();
  bool _initialized = false;
  bool _speaking = false;

  @override
  bool get isInitialized => _initialized;

  @override
  bool get isSpeaking => _speaking;

  @override
  Future<void> initialize() async {
    if (_initialized) return;
    _initialized = true;
    await _tts.awaitSpeakCompletion(true);
  }

  @override
  Future<void> setLanguage(String locale) async {
    await _tts.setLanguage(locale);
  }

  @override
  Future<void> setSpeechRate(double rate) async {
    await _tts.setSpeechRate(rate);
  }

  @override
  Future<void> setVolume(double volume) async {
    await _tts.setVolume(volume);
  }

  @override
  Future<void> setPitch(double pitch) async {
    await _tts.setPitch(pitch);
  }

  @override
  void setStartHandler(VoidCallback onStart) {
    _tts.setStartHandler(() {
      _speaking = true;
      onStart();
    });
  }

  @override
  void setCompletionHandler(VoidCallback onComplete) {
    _tts.setCompletionHandler(() {
      _speaking = false;
      onComplete();
    });
  }

  @override
  void setErrorHandler(void Function(String error) onError) {
    _tts.setErrorHandler((msg) {
      _speaking = false;
      onError(msg);
    });
  }

  @override
  Future<void> speak(String text) async {
    await _tts.speak(text);
  }

  @override
  Future<void> stop() async {
    await _tts.stop();
    _speaking = false;
  }

  @override
  Future<void> dispose() async {
    await _tts.stop();
    _initialized = false;
  }
}
