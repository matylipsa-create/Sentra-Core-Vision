import 'package:flutter_test/flutter_test.dart';
import 'package:sentra_core/services/sensor_mitigation_engine.dart';
import 'package:sentra_core/models/navigation_payloads.dart';

void main() {
  group('SensorMitigationEngine', () {
    test('suppresses events above noise floor', () {
      final engine = SensorMitigationEngine(noiseFloorM: 3.0);
      final decision = engine.process(5.0, 1000);
      expect(decision, isNull);
      expect(engine.suppressedCount, 1);
    });

    test('emits low severity for distant obstacles', () {
      final engine = SensorMitigationEngine(
        noiseFloorM: 3.0,
        mediumThresholdM: 1.5,
        criticalThresholdM: 0.5,
      );
      final decision = engine.process(2.5, 1000);
      expect(decision, isNotNull);
      expect(decision!.severity, MitigationSeverity.low);
      expect(decision.hapticIntensity, HapticIntensity.light);
    });

    test('emits medium severity for moderate obstacles', () {
      final engine = SensorMitigationEngine(
        noiseFloorM: 3.0,
        mediumThresholdM: 1.5,
        criticalThresholdM: 0.5,
      );
      final decision = engine.process(1.0, 1000);
      expect(decision, isNotNull);
      expect(decision!.severity, MitigationSeverity.medium);
      expect(decision.hapticIntensity, HapticIntensity.strong);
    });

    test('emits critical severity for imminent obstacles', () {
      final engine = SensorMitigationEngine(
        noiseFloorM: 3.0,
        mediumThresholdM: 1.5,
        criticalThresholdM: 0.5,
      );
      final decision = engine.process(0.3, 1000);
      expect(decision, isNotNull);
      expect(decision!.severity, MitigationSeverity.critical);
      expect(decision.hapticIntensity, HapticIntensity.critical);
    });

    test('debounces rapid successive events', () {
      final engine = SensorMitigationEngine(
        noiseFloorM: 3.0,
        debounceMs: 400,
      );
      final first = engine.process(1.0, 1000);
      expect(first, isNotNull);
      final second = engine.process(1.0, 1200);
      expect(second, isNull);
      expect(engine.suppressedCount, 1);
    });

    test('allows event after debounce window passes', () {
      final engine = SensorMitigationEngine(
        noiseFloorM: 3.0,
        debounceMs: 400,
      );
      final first = engine.process(1.0, 1000);
      expect(first, isNotNull);
      final second = engine.process(1.0, 1500);
      expect(second, isNotNull);
    });

    test('reset clears all state', () {
      final engine = SensorMitigationEngine();
      engine.process(1.0, 1000);
      engine.reset();
      expect(engine.lastDecision, isNull);
      expect(engine.suppressedCount, 0);
    });

    test('haptic patterns differ by severity', () {
      final engine = SensorMitigationEngine();
      final low = engine.process(2.5, 1000);
      final med = engine.process(1.0, 2000);
      final crit = engine.process(0.3, 3000);
      expect(low!.hapticPattern, isNot(med!.hapticPattern));
      expect(med.hapticPattern, isNot(crit!.hapticPattern));
      expect(low.hapticPattern.length, lessThan(med.hapticPattern.length));
      expect(med.hapticPattern.length, lessThan(crit.hapticPattern.length));
    });
  });

  group('MitigationDecision', () {
    test('toJson serializes all fields', () {
      const decision = MitigationDecision(
        severity: MitigationSeverity.critical,
        hapticIntensity: HapticIntensity.critical,
        hapticPattern: [500, 100, 500],
        reason: 'test',
        distanceMeters: 0.3,
        timestamp: 12345,
      );
      final json = decision.toJson();
      expect(json['severity'], 'critical');
      expect(json['hapticIntensity'], 'critical');
      expect(json['distanceMeters'], 0.3);
      expect(json['timestamp'], 12345);
    });
  });
}
