import 'package:flutter_test/flutter_test.dart';
import 'package:sentra_core/services/cognitive_load_manager.dart';

void main() {
  group('CognitiveLoadManager', () {
    test('starts at normal level with no alerts', () {
      final mgr = CognitiveLoadManager();
      expect(mgr.level, CognitiveLoadLevel.normal);
      expect(mgr.currentAlertCount, 0);
      expect(mgr.isStreamlinedMode, isFalse);
      expect(mgr.ttsRateMultiplier, 1.0);
    });

    test('shouldSpeakSecondary is true in normal mode', () {
      final mgr = CognitiveLoadManager();
      expect(mgr.shouldSpeakSecondary, isTrue);
    });

    test('reset restores normal state', () {
      final mgr = CognitiveLoadManager(elevatedThreshold: 2, criticalThreshold: 5);
      mgr.reset();
      expect(mgr.level, CognitiveLoadLevel.normal);
      expect(mgr.currentAlertCount, 0);
    });

    test('shouldSpeakObstacle allows all in non-streamlined mode', () {
      final mgr = CognitiveLoadManager();
      expect(mgr.shouldSpeakObstacle(2.0, 'left'), isTrue);
      expect(mgr.shouldSpeakObstacle(0.3, 'front'), isTrue);
    });

    test('refresh does not crash on empty state', () {
      final mgr = CognitiveLoadManager();
      mgr.refresh();
      expect(mgr.level, CognitiveLoadLevel.normal);
    });
  });

  group('CognitiveLoadLevel', () {
    test('has three levels', () {
      expect(CognitiveLoadLevel.values.length, 3);
      expect(CognitiveLoadLevel.values, contains(CognitiveLoadLevel.normal));
      expect(CognitiveLoadLevel.values, contains(CognitiveLoadLevel.elevated));
      expect(CognitiveLoadLevel.values, contains(CognitiveLoadLevel.critical));
    });
  });
}
