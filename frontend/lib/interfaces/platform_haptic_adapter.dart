import 'package:flutter/services.dart';

import 'hardware_interfaces.dart';

/// Haptic adapter that delegates to Flutter's built-in [HapticFeedback],
/// which maps to native Android Vibrator and iOS Taptic on mobile, and
/// gracefully no-ops on desktop platforms.
class PlatformHapticAdapter implements IHapticService {
  @override
  Future<void> lightImpact() => HapticFeedback.lightImpact();

  @override
  Future<void> mediumImpact() => HapticFeedback.mediumImpact();

  @override
  Future<void> heavyImpact() => HapticFeedback.heavyImpact();

  @override
  Future<void> vibrate() => HapticFeedback.vibrate();

  @override
  Future<void> vibratePattern(List<int> pattern) async {
    for (final durationMs in pattern) {
      await HapticFeedback.vibrate();
      await Future<void>.delayed(Duration(milliseconds: durationMs));
    }
  }
}
