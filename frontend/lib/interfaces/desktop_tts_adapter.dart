import 'dart:async';

import 'hardware_interfaces.dart';

/// Desktop / Windows TTS stub that logs to console instead of speaking.
///
/// On platforms where [FlutterTts] has no native backing, this keeps the
/// app compilable and functional for development without crashing.
class DesktopTtsAdapter implements ITtsService {
  bool _initialized = false;
  bool _speaking = false;

  VoidCallback? _onStart;
  VoidCallback? _onComplete;

  @override
  bool get isInitialized => _initialized;

  @override
  bool get isSpeaking => _speaking;

  @override
  Future<void> initialize() async {
    _initialized = true;
  }

  @override
  Future<void> setLanguage(String locale) async {}

  @override
  Future<void> setSpeechRate(double rate) async {}

  @override
  Future<void> setVolume(double volume) async {}

  @override
  Future<void> setPitch(double pitch) async {}

  @override
  void setStartHandler(VoidCallback onStart) => _onStart = onStart;

  @override
  void setCompletionHandler(VoidCallback onComplete) =>
      _onComplete = onComplete;

  @override
  void setErrorHandler(void Function(String error) onError) {}

  @override
  Future<void> speak(String text) async {
    _speaking = true;
    _onStart?.call();
    print('[Desktop TTS] $text');
    await Future<void>.delayed(Duration(milliseconds: text.length * 30));
    _speaking = false;
    _onComplete?.call();
  }

  @override
  Future<void> stop() async {
    _speaking = false;
  }

  @override
  Future<void> dispose() async {
    _initialized = false;
  }
}
