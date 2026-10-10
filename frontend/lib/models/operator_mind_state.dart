import 'package:flutter/foundation.dart';

/// Mental stability mode for the operator.
///
/// In REAL_NUMBER mode the operator perceives the environment accurately.
/// In IMAGINARY_NUMBER mode, perception is distorted — the system compensates
/// by increasing haptic and TTS feedback density for accessibility users.
enum MindStateMode { realNumber, imaginaryNumber }

/// Accessibility-aware parameters derived from the operator's mental state.
///
/// Instead of chromatic aberration and color shifts (which are invisible to
/// blind / low-vision users), the distortion is translated into haptic
/// intensity scaling and TTS rate adjustments that the accessibility layer
/// can consume directly.
@immutable
class HudDistortionParams {
  final double hapticIntensityMultiplier;
  final double ttsRateMultiplier;
  final bool announceDistortion;
  final String semanticLabel;

  const HudDistortionParams({
    required this.hapticIntensityMultiplier,
    required this.ttsRateMultiplier,
    required this.announceDistortion,
    required this.semanticLabel,
  });

  factory HudDistortionParams.stable() => const HudDistortionParams(
        hapticIntensityMultiplier: 1.0,
        ttsRateMultiplier: 1.0,
        announceDistortion: false,
        semanticLabel: 'Percepción estable',
      );

  factory HudDistortionParams.distorted(double severity) {
    final clamped = severity.clamp(0.0, 1.0);
    return HudDistortionParams(
      hapticIntensityMultiplier: 1.0 + clamped * 1.5,
      ttsRateMultiplier: 1.0 - clamped * 0.3,
      announceDistortion: clamped > 0.5,
      semanticLabel: clamped > 0.7
          ? 'Percepción severamente distorsionada'
          : 'Percepción distorsionada',
    );
  }
}

/// Immutable model representing the operator's mental stability state.
///
/// Stability ranges from 0 (breakdown) to 100 (fully stable). When stability
/// drops below [distortionThreshold], the state mode flips to
/// [MindStateMode.imaginaryNumber] and the system increases compensatory
/// accessibility feedback.
@immutable
class OperatorMindState {
  final double stability;
  final MindStateMode stateMode;
  final double breachExposure;
  final int updatedAt;

  static const double distortionThreshold = 40.0;
  static const double criticalThreshold = 15.0;

  const OperatorMindState({
    this.stability = 100.0,
    this.stateMode = MindStateMode.realNumber,
    this.breachExposure = 0.0,
    this.updatedAt = 0,
  });

  /// Whether the operator is in the distorted perception mode.
  bool get isDistorted => stateMode == MindStateMode.imaginaryNumber;

  /// Whether stability is at a critical level.
  bool get isCritical => stability <= criticalThreshold;

  /// Distortion severity as a normalized 0–1 value.
  double get distortionSeverity {
    if (stability >= distortionThreshold) return 0.0;
    return ((distortionThreshold - stability) / distortionThreshold)
        .clamp(0.0, 1.0);
  }

  /// Returns accessibility-friendly distortion parameters.
  HudDistortionParams getHudDistortionParams() {
    if (!isDistorted) return HudDistortionParams.stable();
    return HudDistortionParams.distorted(distortionSeverity);
  }

  /// Applies breach exposure, reducing stability and potentially flipping mode.
  OperatorMindState applyBreachExposure(double exposure) {
    final newExposure = breachExposure + exposure;
    final newStability = (stability - exposure).clamp(0.0, 100.0);
    final newMode = newStability < distortionThreshold
        ? MindStateMode.imaginaryNumber
        : MindStateMode.realNumber;
    return OperatorMindState(
      stability: newStability,
      stateMode: newMode,
      breachExposure: newExposure,
      updatedAt: DateTime.now().millisecondsSinceEpoch,
    );
  }

  /// Recovers stability by the given amount (e.g. after completing a mission).
  OperatorMindState recover(double amount) {
    final newStability = (stability + amount).clamp(0.0, 100.0);
    final newMode = newStability >= distortionThreshold
        ? MindStateMode.realNumber
        : MindStateMode.imaginaryNumber;
    return OperatorMindState(
      stability: newStability,
      stateMode: newMode,
      breachExposure: breachExposure,
      updatedAt: DateTime.now().millisecondsSinceEpoch,
    );
  }

  OperatorMindState copyWith({
    double? stability,
    MindStateMode? stateMode,
    double? breachExposure,
    int? updatedAt,
  }) {
    return OperatorMindState(
      stability: stability ?? this.stability,
      stateMode: stateMode ?? this.stateMode,
      breachExposure: breachExposure ?? this.breachExposure,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  factory OperatorMindState.fromJson(Map<String, dynamic> json) {
    return OperatorMindState(
      stability: (json['stability'] as num?)?.toDouble() ?? 100.0,
      stateMode: json['state_mode'] == 'IMAGINARY_NUMBER'
          ? MindStateMode.imaginaryNumber
          : MindStateMode.realNumber,
      breachExposure: (json['breach_exposure'] as num?)?.toDouble() ?? 0.0,
      updatedAt: (json['updated_at'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'stability': stability,
        'state_mode':
            stateMode == MindStateMode.imaginaryNumber
                ? 'IMAGINARY_NUMBER'
                : 'REAL_NUMBER',
        'breach_exposure': breachExposure,
        'updated_at': updatedAt,
      };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is OperatorMindState &&
          other.stability == stability &&
          other.stateMode == stateMode &&
          other.breachExposure == breachExposure);

  @override
  int get hashCode => Object.hash(stability, stateMode, breachExposure);
}
