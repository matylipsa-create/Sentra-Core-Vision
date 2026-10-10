import 'dart:convert';

import 'navigation_payloads.dart';

/// Parsed accessibility profile loaded from external JSON.
///
/// This model represents a deserialized entry from
/// `accessibility_profile_schema.json`, allowing per-profile configuration
/// of proximity thresholds, TTS rates, haptic delays, and cognitive load
/// tolerance without code changes.
class ExternalAccessibilityProfile {
  final String profileId;
  final AccessibilityProfileType type;
  final bool ttsEnabled;
  final double ttsRate;
  final bool morseMode;
  final bool hapticEnabled;
  final HapticIntensity baselineHaptic;
  final int vibrationDelayMs;
  final double proximityThresholdM;
  final double uiScale;
  final double elevatedThreshold;
  final double criticalThreshold;

  const ExternalAccessibilityProfile({
    required this.profileId,
    required this.type,
    required this.ttsEnabled,
    required this.ttsRate,
    required this.morseMode,
    required this.hapticEnabled,
    required this.baselineHaptic,
    required this.vibrationDelayMs,
    required this.proximityThresholdM,
    required this.uiScale,
    required this.elevatedThreshold,
    required this.criticalThreshold,
  });

  factory ExternalAccessibilityProfile.fromJson(Map<String, dynamic> json) {
    final tts = json['tts'] as Map<String, dynamic>? ?? {};
    final haptic = json['haptic'] as Map<String, dynamic>? ?? {};
    final cogLoad = json['cognitiveLoad'] as Map<String, dynamic>? ?? {};

    return ExternalAccessibilityProfile(
      profileId: json['profileId'] as String? ?? '',
      type: _parseType(json['type'] as String? ?? 'blind'),
      ttsEnabled: tts['enabled'] as bool? ?? true,
      ttsRate: (tts['rate'] as num?)?.toDouble() ?? 1.0,
      morseMode: tts['morseMode'] as bool? ?? false,
      hapticEnabled: haptic['enabled'] as bool? ?? true,
      baselineHaptic: _parseIntensity(haptic['baselineIntensity'] as String? ?? 'medium'),
      vibrationDelayMs: haptic['vibrationDelayMs'] as int? ?? 0,
      proximityThresholdM: (json['proximityThresholdM'] as num?)?.toDouble() ?? 1.5,
      uiScale: (json['uiScale'] as num?)?.toDouble() ?? 1.5,
      elevatedThreshold: (cogLoad['elevatedThreshold'] as num?)?.toDouble() ?? 8,
      criticalThreshold: (cogLoad['criticalThreshold'] as num?)?.toDouble() ?? 15,
    );
  }

  Map<String, dynamic> toJson() => {
        'profileId': profileId,
        'type': type.name,
        'tts': {
          'enabled': ttsEnabled,
          'rate': ttsRate,
          'morseMode': morseMode,
        },
        'haptic': {
          'enabled': hapticEnabled,
          'baselineIntensity': baselineHaptic.name,
          'vibrationDelayMs': vibrationDelayMs,
        },
        'proximityThresholdM': proximityThresholdM,
        'uiScale': uiScale,
        'cognitiveLoad': {
          'elevatedThreshold': elevatedThreshold,
          'criticalThreshold': criticalThreshold,
        },
      };

  static AccessibilityProfileType _parseType(String value) {
    return AccessibilityProfileType.values.byName(value);
  }

  static HapticIntensity _parseIntensity(String value) {
    return HapticIntensity.values.byName(value);
  }
}

/// Parses a full JSON profile document conforming to the schema and returns
/// a list of [ExternalAccessibilityProfile] entries.
class AccessibilityProfileParser {
  AccessibilityProfileParser._();

  /// Parses a JSON string into a list of profiles.
  /// Throws [FormatException] if the JSON is invalid or contains no profiles.
  static List<ExternalAccessibilityProfile> parseString(String jsonString) {
    final decoded = jsonDecode(jsonString) as Map<String, dynamic>;
    return parseJson(decoded);
  }

  /// Parses a decoded JSON map into a list of profiles.
  static List<ExternalAccessibilityProfile> parseJson(Map<String, dynamic> json) {
    final profiles = json['profiles'] as List?;
    if (profiles == null || profiles.isEmpty) {
      throw const FormatException('No "profiles" array found in JSON.');
    }
    return profiles
        .map((e) => ExternalAccessibilityProfile.fromJson(e as Map<String, dynamic>))
        .toList(growable: false);
  }

  /// Finds a profile by ID within a parsed list.
  static ExternalAccessibilityProfile? findById(
    List<ExternalAccessibilityProfile> profiles,
    String id,
  ) {
    for (final p in profiles) {
      if (p.profileId == id) return p;
    }
    return null;
  }
}
