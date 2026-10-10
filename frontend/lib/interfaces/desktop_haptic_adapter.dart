import 'hardware_interfaces.dart';

/// Desktop haptic stub — no native vibration on Windows/Linux/macOS.
/// Logs to console for development debugging.
class DesktopHapticAdapter implements IHapticService {
  @override
  Future<void> lightImpact() async {
    print('[Desktop Haptic] lightImpact');
  }

  @override
  Future<void> mediumImpact() async {
    print('[Desktop Haptic] mediumImpact');
  }

  @override
  Future<void> heavyImpact() async {
    print('[Desktop Haptic] heavyImpact');
  }

  @override
  Future<void> vibrate() async {
    print('[Desktop Haptic] vibrate');
  }

  @override
  Future<void> vibratePattern(List<int> pattern) async {
    print('[Desktop Haptic] pattern: $pattern');
  }
}
