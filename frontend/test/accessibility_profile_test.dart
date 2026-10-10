import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:sentra_core/models/accessibility_profile.dart';
import 'package:sentra_core/models/navigation_payloads.dart';

const _testJson = '''
{
  "profiles": [
    {
      "profileId": "blind_calm",
      "type": "blind",
      "tts": {
        "enabled": true,
        "rate": 1.5,
        "morseMode": true
      },
      "haptic": {
        "enabled": true,
        "baselineIntensity": "medium",
        "vibrationDelayMs": 50
      },
      "proximityThresholdM": 1.5,
      "uiScale": 1.5,
      "cognitiveLoad": {
        "elevatedThreshold": 6,
        "criticalThreshold": 12
      }
    },
    {
      "profileId": "deaf_blind_high",
      "type": "deafBlind",
      "tts": {
        "enabled": false,
        "rate": 0,
        "morseMode": true
      },
      "haptic": {
        "enabled": true,
        "baselineIntensity": "critical",
        "vibrationDelayMs": 0
      },
      "proximityThresholdM": 2.0,
      "uiScale": 1.5,
      "cognitiveLoad": {
        "elevatedThreshold": 4,
        "criticalThreshold": 8
      }
    }
  ]
}
''';

void main() {
  group('AccessibilityProfileParser', () {
    test('parseString returns two profiles', () {
      final profiles = AccessibilityProfileParser.parseString(_testJson);
      expect(profiles.length, 2);
    });

    test('parses blind profile correctly', () {
      final profiles = AccessibilityProfileParser.parseString(_testJson);
      final p = profiles.first;
      expect(p.profileId, 'blind_calm');
      expect(p.type, AccessibilityProfileType.blind);
      expect(p.ttsEnabled, isTrue);
      expect(p.ttsRate, 1.5);
      expect(p.morseMode, isTrue);
      expect(p.hapticEnabled, isTrue);
      expect(p.baselineHaptic, HapticIntensity.medium);
      expect(p.vibrationDelayMs, 50);
      expect(p.proximityThresholdM, 1.5);
      expect(p.elevatedThreshold, 6);
      expect(p.criticalThreshold, 12);
    });

    test('parses deafBlind profile correctly', () {
      final profiles = AccessibilityProfileParser.parseString(_testJson);
      final p = profiles[1];
      expect(p.profileId, 'deaf_blind_high');
      expect(p.type, AccessibilityProfileType.deafBlind);
      expect(p.ttsEnabled, isFalse);
      expect(p.morseMode, isTrue);
      expect(p.baselineHaptic, HapticIntensity.critical);
      expect(p.proximityThresholdM, 2.0);
      expect(p.elevatedThreshold, 4);
      expect(p.criticalThreshold, 8);
    });

    test('throws FormatException for missing profiles array', () {
      expect(
        () => AccessibilityProfileParser.parseString('{}'),
        throwsFormatException,
      );
    });

    test('throws on invalid JSON', () {
      expect(
        () => AccessibilityProfileParser.parseString('not json'),
        throwsA(isA<FormatException>()),
      );
    });

    test('findById returns the matching profile', () {
      final profiles = AccessibilityProfileParser.parseString(_testJson);
      final found = AccessibilityProfileParser.findById(profiles, 'blind_calm');
      expect(found, isNotNull);
      expect(found!.profileId, 'blind_calm');
    });

    test('findById returns null for unknown id', () {
      final profiles = AccessibilityProfileParser.parseString(_testJson);
      final found = AccessibilityProfileParser.findById(profiles, 'nonexistent');
      expect(found, isNull);
    });

    test('fromJson applies defaults for missing optional fields', () {
      final p = ExternalAccessibilityProfile.fromJson({
        'profileId': 'minimal',
        'type': 'lowVision',
        'tts': {'enabled': true, 'rate': 1.2},
        'haptic': {'enabled': true, 'baselineIntensity': 'light'},
        'proximityThresholdM': 1.0,
        'cognitiveLoad': {'elevatedThreshold': 5, 'criticalThreshold': 10},
      });
      expect(p.morseMode, isFalse);
      expect(p.vibrationDelayMs, 0);
      expect(p.uiScale, 1.5);
    });

    test('toJson roundtrips correctly', () {
      final profiles = AccessibilityProfileParser.parseString(_testJson);
      final p = profiles.first;
      final json = p.toJson();
      final restored = ExternalAccessibilityProfile.fromJson(json);
      expect(restored.profileId, p.profileId);
      expect(restored.type, p.type);
      expect(restored.ttsRate, p.ttsRate);
      expect(restored.baselineHaptic, p.baselineHaptic);
      expect(restored.proximityThresholdM, p.proximityThresholdM);
      expect(restored.elevatedThreshold, p.elevatedThreshold);
    });
  });
}
