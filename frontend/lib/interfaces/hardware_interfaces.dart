/// Abstract interfaces that decouple business logic from platform-specific
/// hardware plugins. Concrete adapters are registered in [ServiceLocator]
/// based on the detected platform (Android, Windows, Desktop, Web).

// ---------------------------------------------------------------------------
// TTS
// ---------------------------------------------------------------------------

/// Text-to-speech engine abstraction.
///
/// Implementations must support locale configuration, speech-rate control,
/// priority-based interruption, and start/completion/error callbacks.
abstract class ITtsService {
  bool get isInitialized;
  bool get isSpeaking;

  Future<void> initialize();
  Future<void> setLanguage(String locale);
  Future<void> setSpeechRate(double rate);
  Future<void> setVolume(double volume);
  Future<void> setPitch(double pitch);

  void setStartHandler(VoidCallback onStart);
  void setCompletionHandler(VoidCallback onComplete);
  void setErrorHandler(void Function(String error) onError);

  Future<void> speak(String text);
  Future<void> stop();
  Future<void> dispose();
}

// ---------------------------------------------------------------------------
// Haptics
// ---------------------------------------------------------------------------

/// Vibration / haptic feedback engine abstraction.
abstract class IHapticService {
  Future<void> lightImpact();
  Future<void> mediumImpact();
  Future<void> heavyImpact();
  Future<void> vibrate();
  Future<void> vibratePattern(List<int> pattern);
}

// ---------------------------------------------------------------------------
// Camera
// ---------------------------------------------------------------------------

/// Camera availability and frame-providing abstraction.
///
/// Concrete Android adapter checks real camera permission and availability;
/// Desktop adapter returns [CameraStatus.unavailable] so the UI can show
/// simulation mode.
enum CameraStatus { available, permissionDenied, unavailable }

class CameraInfo {
  final CameraStatus status;
  final String message;

  const CameraInfo({required this.status, required this.message});

  bool get isAvailable => status == CameraStatus.available;
}

abstract class ICameraService {
  Future<CameraInfo> checkAvailability();
  Future<bool> requestPermission();
}
