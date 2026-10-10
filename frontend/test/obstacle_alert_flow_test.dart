import 'package:flutter_test/flutter_test.dart';
import 'package:sentra_core/models/navigation_payloads.dart';
import 'package:sentra_core/services/event_bus.dart';
import 'package:sentra_core/services/camera_duty_cycle_controller.dart';

/// Integration test for the obstacle alert flow:
/// camera duty cycle -> camera_frame event -> haptic event emitted.
void main() {
  group('Obstacle alert flow', () {
    test('nearby obstacle triggers camera_frame and haptic events', () async {
      final bus = SentraEventBus();
      final controller = CameraDutyCycleController(bus: bus);

      final cameraEvents = <SentraEvent>[];
      final hapticEvents = <SentraEvent>[];

      bus.on(SentraEventType.cameraFrame).listen(cameraEvents.add);
      bus.on(SentraEventType.haptic).listen(hapticEvents.add);

      controller.start((_) => 0.5);
      await Future<void>.delayed(const Duration(milliseconds: 300));
      controller.stop();

      expect(cameraEvents, isNotEmpty);
      final lastFrame = cameraEvents.last;
      expect(lastFrame.type, SentraEventType.cameraFrame);
      expect(lastFrame.payload['obstacleProximity'], true);
      expect(lastFrame.payload['estimatedDistanceMeters'], closeTo(0.5, 0.01));

      expect(hapticEvents, isNotEmpty);
      expect(hapticEvents.last.type, SentraEventType.haptic);
      expect(hapticEvents.last.payload['reason'], 'obstacle_proximity');

      await bus.dispose();
    });

    test('far obstacle triggers camera_frame but no haptic', () async {
      final bus = SentraEventBus();
      final controller = CameraDutyCycleController(bus: bus);

      final cameraEvents = <SentraEvent>[];
      final hapticEvents = <SentraEvent>[];

      bus.on(SentraEventType.cameraFrame).listen(cameraEvents.add);
      bus.on(SentraEventType.haptic).listen(hapticEvents.add);

      controller.start((_) => 10.0);
      await Future<void>.delayed(const Duration(milliseconds: 300));
      controller.stop();

      expect(cameraEvents, isNotEmpty);
      expect(cameraEvents.last.payload['obstacleProximity'], false);
      expect(hapticEvents, isEmpty);

      await bus.dispose();
    });

    test('FPS increases when obstacle is close vs far', () async {
      final bus = SentraEventBus();
      final controller = CameraDutyCycleController(
        bus: bus,
        minFps: 2,
        maxFps: 5,
        alertMaxFps: 10,
      );

      final cameraEvents = <SentraEvent>[];

      bus.on(SentraEventType.cameraFrame).listen(cameraEvents.add);

      controller.start((_) => 0.3);
      await Future<void>.delayed(const Duration(milliseconds: 200));
      controller.stop();

      expect(cameraEvents, isNotEmpty);
      final nearFps = cameraEvents.last.payload['fps'] as double;
      expect(nearFps, greaterThan(5.0));

      cameraEvents.clear();
      controller.start((_) => 10.0);
      await Future<void>.delayed(const Duration(milliseconds: 200));
      controller.stop();

      expect(cameraEvents, isNotEmpty);
      final farFps = cameraEvents.last.payload['fps'] as double;
      expect(farFps, lessThanOrEqualTo(5.0));

      await bus.dispose();
    });
  });
}
