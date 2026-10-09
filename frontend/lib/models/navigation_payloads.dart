import 'package:flutter/foundation.dart';

/// Immutable payload for navigation events flowing through the event bus.
///
/// Modeled after the TCREI JSON payload pattern: a discriminated union
/// identified by [mode] with a typed [parameters] map.
@immutable
class NavigationEventPayload {
  final String mode;
  final int targetId;
  final bool accessibilityModeActive;
  final Map<String, dynamic> parameters;

  const NavigationEventPayload({
    required this.mode,
    required this.targetId,
    required this.accessibilityModeActive,
    required this.parameters,
  });

  NavigationEventPayload copyWith({
    String? mode,
    int? targetId,
    bool? accessibilityModeActive,
    Map<String, dynamic>? parameters,
  }) {
    return NavigationEventPayload(
      mode: mode ?? this.mode,
      targetId: targetId ?? this.targetId,
      accessibilityModeActive:
          accessibilityModeActive ?? this.accessibilityModeActive,
      parameters: parameters ?? this.parameters,
    );
  }

  factory NavigationEventPayload.fromJson(Map<String, dynamic> json) {
    return NavigationEventPayload(
      mode: json['mode'] as String,
      targetId: json['targetId'] as int,
      accessibilityModeActive: json['accessibilityModeActive'] as bool,
      parameters:
          Map<String, dynamic>.from(json['parameters'] as Map? ?? const {}),
    );
  }

  Map<String, dynamic> toJson() => {
        'mode': mode,
        'targetId': targetId,
        'accessibilityModeActive': accessibilityModeActive,
        'parameters': parameters,
      };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is NavigationEventPayload &&
          other.mode == mode &&
          other.targetId == targetId &&
          other.accessibilityModeActive == accessibilityModeActive &&
          _mapEquals(other.parameters, parameters));

  @override
  int get hashCode =>
      Object.hash(mode, targetId, accessibilityModeActive, parameters);

  static bool _mapEquals(Map<String, dynamic> a, Map<String, dynamic> b) {
    if (a.length != b.length) return false;
    for (final key in a.keys) {
      if (!b.containsKey(key) || a[key] != b[key]) return false;
    }
    return true;
  }
}

/// Navigation mode constants used as [NavigationEventPayload.mode].
class NavigationMode {
  NavigationMode._();

  static const String obstacleDetection = 'obstacle_detection';
  static const String indoorGuidance = 'indoor_guidance';
  static const String textOcr = 'text_ocr';
  static const String sceneDescription = 'scene_description';
  static const String silence = 'silence';
}

/// Camera frame payload produced by the duty cycle controller.
@immutable
class CameraFramePayload {
  final int frameId;
  final double fps;
  final bool obstacleProximity;
  final double estimatedDistanceMeters;
  final List<DetectedObject> detections;
  final int timestamp;

  const CameraFramePayload({
    required this.frameId,
    required this.fps,
    required this.obstacleProximity,
    required this.estimatedDistanceMeters,
    required this.detections,
    required this.timestamp,
  });

  factory CameraFramePayload.fromJson(Map<String, dynamic> json) {
    return CameraFramePayload(
      frameId: json['frameId'] as int,
      fps: (json['fps'] as num).toDouble(),
      obstacleProximity: json['obstacleProximity'] as bool,
      estimatedDistanceMeters: (json['estimatedDistanceMeters'] as num).toDouble(),
      detections: (json['detections'] as List? ?? [])
          .map((d) => DetectedObject.fromJson(d as Map<String, dynamic>))
          .toList(),
      timestamp: json['timestamp'] as int,
    );
  }

  Map<String, dynamic> toJson() => {
        'frameId': frameId,
        'fps': fps,
        'obstacleProximity': obstacleProximity,
        'estimatedDistanceMeters': estimatedDistanceMeters,
        'detections': detections.map((d) => d.toJson()).toList(),
        'timestamp': timestamp,
      };
}

/// A single object detected in a camera frame.
@immutable
class DetectedObject {
  final String label;
  final double confidence;
  final double distanceMeters;
  final String relativePosition;

  const DetectedObject({
    required this.label,
    required this.confidence,
    required this.distanceMeters,
    required this.relativePosition,
  });

  factory DetectedObject.fromJson(Map<String, dynamic> json) {
    return DetectedObject(
      label: json['label'] as String,
      confidence: (json['confidence'] as num).toDouble(),
      distanceMeters: (json['distanceMeters'] as num).toDouble(),
      relativePosition: json['relativePosition'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'label': label,
        'confidence': confidence,
        'distanceMeters': distanceMeters,
        'relativePosition': relativePosition,
      };
}

/// Haptic feedback request payload.
@immutable
class HapticPayload {
  final HapticIntensity intensity;
  final List<int> pattern;
  final String reason;

  const HapticPayload({
    required this.intensity,
    required this.pattern,
    required this.reason,
  });

  factory HapticPayload.fromJson(Map<String, dynamic> json) {
    return HapticPayload(
      intensity: HapticIntensity.values.byName(json['intensity'] as String),
      pattern: List<int>.from(json['pattern'] as List? ?? const []),
      reason: json['reason'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'intensity': intensity.name,
        'pattern': pattern,
        'reason': reason,
      };
}

enum HapticIntensity { light, medium, strong, critical }

/// TTS request payload.
@immutable
class TtsPayload {
  final String text;
  final double rate;
  final TtsPriority priority;

  const TtsPayload({
    required this.text,
    this.rate = 1.0,
    this.priority = TtsPriority.normal,
  });

  factory TtsPayload.fromJson(Map<String, dynamic> json) {
    return TtsPayload(
      text: json['text'] as String,
      rate: (json['rate'] as num?)?.toDouble() ?? 1.0,
      priority: TtsPriority.values.byName(json['priority'] as String? ?? 'normal'),
    );
  }

  Map<String, dynamic> toJson() => {
        'text': text,
        'rate': rate,
        'priority': priority.name,
      };
}

enum TtsPriority { low, normal, critical }

/// Accessibility profile payload describing the active user profile.
@immutable
class AccessibilityProfilePayload {
  final String profileId;
  final AccessibilityProfileType type;
  final bool ttsEnabled;
  final bool hapticEnabled;
  final double ttsRate;
  final HapticIntensity baselineHaptic;
  final double uiScale;
  final bool morseMode;

  const AccessibilityProfilePayload({
    required this.profileId,
    required this.type,
    required this.ttsEnabled,
    required this.hapticEnabled,
    required this.ttsRate,
    required this.baselineHaptic,
    required this.uiScale,
    required this.morseMode,
  });

  AccessibilityProfilePayload copyWith({
    String? profileId,
    AccessibilityProfileType? type,
    bool? ttsEnabled,
    bool? hapticEnabled,
    double? ttsRate,
    HapticIntensity? baselineHaptic,
    double? uiScale,
    bool? morseMode,
  }) {
    return AccessibilityProfilePayload(
      profileId: profileId ?? this.profileId,
      type: type ?? this.type,
      ttsEnabled: ttsEnabled ?? this.ttsEnabled,
      hapticEnabled: hapticEnabled ?? this.hapticEnabled,
      ttsRate: ttsRate ?? this.ttsRate,
      baselineHaptic: baselineHaptic ?? this.baselineHaptic,
      uiScale: uiScale ?? this.uiScale,
      morseMode: morseMode ?? this.morseMode,
    );
  }

  factory AccessibilityProfilePayload.fromJson(Map<String, dynamic> json) {
    return AccessibilityProfilePayload(
      profileId: json['profileId'] as String,
      type: AccessibilityProfileType.values.byName(json['type'] as String),
      ttsEnabled: json['ttsEnabled'] as bool,
      hapticEnabled: json['hapticEnabled'] as bool,
      ttsRate: (json['ttsRate'] as num).toDouble(),
      baselineHaptic:
          HapticIntensity.values.byName(json['baselineHaptic'] as String),
      uiScale: (json['uiScale'] as num).toDouble(),
      morseMode: json['morseMode'] as bool,
    );
  }

  Map<String, dynamic> toJson() => {
        'profileId': profileId,
        'type': type.name,
        'ttsEnabled': ttsEnabled,
        'hapticEnabled': hapticEnabled,
        'ttsRate': ttsRate,
        'baselineHaptic': baselineHaptic.name,
        'uiScale': uiScale,
        'morseMode': morseMode,
      };
}

enum AccessibilityProfileType { blind, lowVision, deafBlind }
