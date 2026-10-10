import 'package:flutter/foundation.dart';

import '../models/navigation_payloads.dart';
import 'event_bus.dart';

/// Manages accessibility profiles and broadcasts profile changes on the bus.
///
/// Three built-in profiles:
/// - **Blind**: TTS spatial audio + haptic Morse, no visual reliance.
/// - **Low Vision**: high-contrast black/yellow theme, giant typography.
/// - **Deaf-Blind**: TTS disabled, haptic Morse patterns maximized.
class AccessibilityProfileManager extends ChangeNotifier {
  final SentraEventBus _bus;

  AccessibilityProfilePayload _active;
  final Map<String, AccessibilityProfilePayload> _profiles;

  AccessibilityProfileManager({SentraEventBus? bus})
      : _bus = bus ?? EventBusProvider.instance,
        _active = _blindDefault,
        _profiles = {
          _blindDefault.profileId: _blindDefault,
          _lowVisionDefault.profileId: _lowVisionDefault,
          _deafBlindDefault.profileId: _deafBlindDefault,
        };

  AccessibilityProfilePayload get active => _active;

  List<AccessibilityProfilePayload> get allProfiles =>
      _profiles.values.toList(growable: false);

  /// Switches to the profile with [profileId] and broadcasts the change.
  void setProfile(String profileId) {
    final profile = _profiles[profileId];
    if (profile == null || profile == _active) return;
    _active = profile;
    notifyListeners();
    _bus.emit(
      SentraEventType.profileChanged,
      profile.toJson(),
    );
  }

  /// Updates fields on the active profile immutably.
  void updateActive(AccessibilityProfilePayload Function(
          AccessibilityProfilePayload current) updater) {
    _active = updater(_active);
    _profiles[_active.profileId] = _active;
    notifyListeners();
  }

  /// Adds or replaces a custom profile.
  void registerProfile(AccessibilityProfilePayload profile) {
    _profiles[profile.profileId] = profile;
  }

  AccessibilityProfilePayload get blind =>
      _profiles['blind'] ?? _blindDefault;
  AccessibilityProfilePayload get lowVision =>
      _profiles['low_vision'] ?? _lowVisionDefault;
  AccessibilityProfilePayload get deafBlind =>
      _profiles['deaf_blind'] ?? _deafBlindDefault;

  static const AccessibilityProfilePayload _blindDefault =
      AccessibilityProfilePayload(
    profileId: 'blind',
    type: AccessibilityProfileType.blind,
    ttsEnabled: true,
    hapticEnabled: true,
    ttsRate: 1.5,
    baselineHaptic: HapticIntensity.medium,
    uiScale: 1.5,
    morseMode: true,
  );

  static const AccessibilityProfilePayload _lowVisionDefault =
      AccessibilityProfilePayload(
    profileId: 'low_vision',
    type: AccessibilityProfileType.lowVision,
    ttsEnabled: true,
    hapticEnabled: true,
    ttsRate: 1.2,
    baselineHaptic: HapticIntensity.light,
    uiScale: 2.0,
    morseMode: false,
  );

  static const AccessibilityProfilePayload _deafBlindDefault =
      AccessibilityProfilePayload(
    profileId: 'deaf_blind',
    type: AccessibilityProfileType.deafBlind,
    ttsEnabled: false,
    hapticEnabled: true,
    ttsRate: 0,
    baselineHaptic: HapticIntensity.strong,
    uiScale: 1.5,
    morseMode: true,
  );
}
