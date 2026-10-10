import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:sentra_core/services/event_bus.dart';
import 'package:sentra_core/services/error_handler.dart';
import 'package:sentra_core/models/navigation_payloads.dart';

void main() {
  group('SentraEvent', () {
    test('toJson produces correct envelope', () {
      final event = SentraEvent(
        type: SentraEventType.tts,
        timestamp: 1700000000000,
        payload: {'text': 'Hola', 'rate': 1.0, 'priority': 'normal'},
      );
      final json = event.toJson();
      expect(json['type'], 'tts');
      expect(json['timestamp'], 1700000000000);
      expect(json['payload']['text'], 'Hola');
      expect(json['payload']['priority'], 'normal');
    });

    test('toString returns valid JSON string', () {
      final event = SentraEvent(
        type: SentraEventType.haptic,
        timestamp: 1700000000000,
        payload: {'intensity': 'medium'},
      );
      final str = event.toString();
      expect(str, contains('"type":"haptic"'));
      expect(str, contains('"intensity":"medium"'));
    });

    test('equality works for same type, timestamp, and payload', () {
      final a = SentraEvent(
        type: SentraEventType.navigation,
        timestamp: 100,
        payload: {'mode': 'obstacle_detection'},
      );
      final b = SentraEvent(
        type: SentraEventType.navigation,
        timestamp: 100,
        payload: {'mode': 'obstacle_detection'},
      );
      expect(a, equals(b));
      expect(a.hashCode, b.hashCode);
    });

    test('inequality for different type', () {
      final a = SentraEvent(
        type: SentraEventType.navigation,
        timestamp: 100,
        payload: {},
      );
      final b = SentraEvent(
        type: SentraEventType.tts,
        timestamp: 100,
        payload: {},
      );
      expect(a, isNot(equals(b)));
    });

    test('inequality for different payload', () {
      final a = SentraEvent(
        type: SentraEventType.tts,
        timestamp: 100,
        payload: {'text': 'A'},
      );
      final b = SentraEvent(
        type: SentraEventType.tts,
        timestamp: 100,
        payload: {'text': 'B'},
      );
      expect(a, isNot(equals(b)));
    });

    test('sentraEvent helper fills timestamp automatically', () {
      final event = sentraEvent(SentraEventType.tts, {'text': 'test'});
      expect(event.type, SentraEventType.tts);
      expect(event.timestamp, greaterThan(0));
      expect(event.payload['text'], 'test');
    });

    test('sentraEvent helper accepts explicit timestamp', () {
      final event = sentraEvent(
        SentraEventType.haptic,
        {'reason': 'test'},
        999,
      );
      expect(event.timestamp, 999);
    });

    test('payload is defensively copied', () {
      final original = <String, dynamic>{'key': 'value'};
      final event = sentraEvent(SentraEventType.error, original);
      original['key'] = 'mutated';
      expect(event.payload['key'], 'value');
    });
  });

  group('SentraEventBus', () {
    late SentraEventBus bus;

    setUp(() {
      bus = SentraEventBus();
    });

    tearDown(() async {
      await bus.dispose();
    });

    test('publish delivers events to stream', () async {
      final event = sentraEvent(SentraEventType.tts, {'text': 'hello'});
      final completer = Completer<SentraEvent>();
      bus.stream.listen(completer.complete);
      bus.publish(event);
      final received = await completer.future;
      expect(received.type, SentraEventType.tts);
      expect(received.payload['text'], 'hello');
    });

    test('on filters by type', () async {
      final ttsCompleter = Completer<SentraEvent>();
      bus.on(SentraEventType.tts).listen(ttsCompleter.complete);
      bus.emit(SentraEventType.haptic, {'intensity': 'light'});
      bus.emit(SentraEventType.tts, {'text': 'filtered'});
      final received = await ttsCompleter.future;
      expect(received.type, SentraEventType.tts);
      expect(received.payload['text'], 'filtered');
    });

    test('emit is convenience for publish + sentraEvent', () async {
      final completer = Completer<SentraEvent>();
      bus.stream.listen(completer.complete);
      bus.emit(SentraEventType.navigation, {'mode': 'text_ocr'}, 12345);
      final received = await completer.future;
      expect(received.type, SentraEventType.navigation);
      expect(received.timestamp, 12345);
      expect(received.payload['mode'], 'text_ocr');
    });

    test('multiple subscribers receive events', () async {
      final c1 = Completer<SentraEvent>();
      final c2 = Completer<SentraEvent>();
      bus.stream.listen(c1.complete);
      bus.stream.listen(c2.complete);
      bus.emit(SentraEventType.tts, {'text': 'broadcast'});
      final r1 = await c1.future;
      final r2 = await c2.future;
      expect(r1.payload['text'], 'broadcast');
      expect(r2.payload['text'], 'broadcast');
    });

    test('on receives only matching types in order', () async {
      final received = <String>[];
      bus.on(SentraEventType.tts).listen((e) => received.add(e.payload['text']));
      bus.emit(SentraEventType.haptic, {'reason': 'skip'});
      bus.emit(SentraEventType.tts, {'text': 'first'});
      bus.emit(SentraEventType.error, {'message': 'skip'});
      bus.emit(SentraEventType.tts, {'text': 'second'});
      await Future<void>.delayed(const Duration(milliseconds: 50));
      expect(received, ['first', 'second']);
    });

    test('isClosed is false before dispose, true after', () async {
      expect(bus.isClosed, false);
      await bus.dispose();
      expect(bus.isClosed, true);
    });

    test('publish after dispose does not throw', () {
      bus.dispose();
      bus.emit(SentraEventType.tts, {'text': 'no-op'});
    });
  });

  group('EventBusProvider', () {
    tearDown(() {
      EventBusProvider.reset();
    });

    test('instance returns same singleton', () {
      final a = EventBusProvider.instance;
      final b = EventBusProvider.instance;
      expect(identical(a, b), true);
    });

    test('reset creates a new bus', () {
      final old = EventBusProvider.instance;
      EventBusProvider.reset();
      final newBus = EventBusProvider.instance;
      expect(identical(old, newBus), false);
    });
  });

  group('EventSubscriptions', () {
    test('cancelAll cancels all subscriptions', () async {
      final bus = SentraEventBus();
      final subs = EventSubscriptions();
      var count = 0;
      subs.add(bus.stream.listen((_) => count++));
      subs.add(bus.stream.listen((_) => count++));
      bus.emit(SentraEventType.tts, {});
      await Future<void>.delayed(const Duration(milliseconds: 10));
      expect(count, 2);
      await subs.cancelAll();
      bus.emit(SentraEventType.tts, {});
      await Future<void>.delayed(const Duration(milliseconds: 10));
      expect(count, 2);
      await bus.dispose();
    });
  });

  group('ErrorHandler', () {
    late SentraEventBus bus;
    late ErrorHandler handler;

    setUp(() {
      bus = SentraEventBus();
      handler = ErrorHandler(bus: bus);
    });

    tearDown(() async {
      await bus.dispose();
    });

    test('report emits an error event on the bus', () async {
      final completer = Completer<SentraEvent>();
      bus.on(SentraEventType.error).listen(completer.complete);
      handler.report('Camera failed', severity: 'critical', source: 'camera');
      final event = await completer.future;
      expect(event.payload['message'], 'Camera failed');
      expect(event.payload['severity'], 'critical');
      expect(event.payload['source'], 'camera');
    });

    test('report stores recent errors', () {
      handler.report('Error 1');
      handler.report('Error 2');
      expect(handler.recentErrors.length, 2);
      expect(handler.recentErrors[0]['message'], 'Error 1');
      expect(handler.recentErrors[1]['message'], 'Error 2');
    });

    test('report caps recent errors at 20', () {
      for (int i = 0; i < 25; i++) {
        handler.report('Error $i');
      }
      expect(handler.recentErrors.length, 20);
      expect(handler.recentErrors.first['message'], 'Error 5');
      expect(handler.recentErrors.last['message'], 'Error 24');
    });

    test('guard catches and reports errors', () async {
      final completer = Completer<SentraEvent>();
      bus.on(SentraEventType.error).listen(completer.complete);
      await handler.guard(
        () async => throw Exception('Test failure'),
        source: 'test',
        code: 'TEST_001',
      );
      final event = await completer.future;
      expect(event.payload['source'], 'test');
      expect(event.payload['code'], 'TEST_001');
      expect(event.payload['severity'], 'critical');
    });

    test('guard does not report when action succeeds', () async {
      var reported = false;
      bus.on(SentraEventType.error).listen((_) => reported = true);
      await handler.guard(() async {}, source: 'test');
      await Future<void>.delayed(const Duration(milliseconds: 10));
      expect(reported, false);
    });

    test('clearRecent empties the list', () {
      handler.report('Error 1');
      expect(handler.recentErrors.length, 1);
      handler.clearRecent();
      expect(handler.recentErrors.length, 0);
    });
  });

  group('JSON Payload roundtrips', () {
    test('NavigationEventPayload toJson/fromJson', () {
      final payload = NavigationEventPayload(
        mode: NavigationMode.obstacleDetection,
        targetId: 42,
        accessibilityModeActive: true,
        parameters: {'distance': 1.5},
      );
      final json = payload.toJson();
      final restored = NavigationEventPayload.fromJson(json);
      expect(restored.mode, NavigationMode.obstacleDetection);
      expect(restored.targetId, 42);
      expect(restored.accessibilityModeActive, true);
      expect(restored.parameters['distance'], 1.5);
    });

    test('CameraFramePayload toJson/fromJson with detections', () {
      final payload = CameraFramePayload(
        frameId: 1,
        fps: 5.0,
        obstacleProximity: true,
        estimatedDistanceMeters: 0.8,
        detections: [
          const DetectedObject(
            label: 'person',
            confidence: 0.95,
            distanceMeters: 0.8,
            relativePosition: 'center',
          ),
        ],
        timestamp: 1700000000000,
      );
      final json = payload.toJson();
      final restored = CameraFramePayload.fromJson(json);
      expect(restored.frameId, 1);
      expect(restored.fps, 5.0);
      expect(restored.obstacleProximity, true);
      expect(restored.estimatedDistanceMeters, 0.8);
      expect(restored.detections.length, 1);
      expect(restored.detections[0].label, 'person');
      expect(restored.detections[0].confidence, 0.95);
    });

    test('HapticPayload toJson/fromJson', () {
      const payload = HapticPayload(
        intensity: HapticIntensity.critical,
        pattern: [500, 100, 500],
        reason: 'obstacle_proximity',
      );
      final json = payload.toJson();
      final restored = HapticPayload.fromJson(json);
      expect(restored.intensity, HapticIntensity.critical);
      expect(restored.pattern, [500, 100, 500]);
      expect(restored.reason, 'obstacle_proximity');
    });

    test('TtsPayload toJson/fromJson with defaults', () {
      const payload = TtsPayload(text: 'Hola mundo');
      final json = payload.toJson();
      final restored = TtsPayload.fromJson(json);
      expect(restored.text, 'Hola mundo');
      expect(restored.rate, 1.0);
      expect(restored.priority, TtsPriority.normal);
    });

    test('TtsPayload toJson/fromJson with critical priority', () {
      const payload = TtsPayload(
        text: 'Peligro',
        rate: 2.0,
        priority: TtsPriority.critical,
      );
      final json = payload.toJson();
      final restored = TtsPayload.fromJson(json);
      expect(restored.text, 'Peligro');
      expect(restored.rate, 2.0);
      expect(restored.priority, TtsPriority.critical);
    });

    test('AccessibilityProfilePayload toJson/fromJson', () {
      const payload = AccessibilityProfilePayload(
        profileId: 'blind',
        type: AccessibilityProfileType.blind,
        ttsEnabled: true,
        hapticEnabled: true,
        ttsRate: 1.5,
        baselineHaptic: HapticIntensity.medium,
        uiScale: 1.5,
        morseMode: true,
      );
      final json = payload.toJson();
      final restored = AccessibilityProfilePayload.fromJson(json);
      expect(restored.profileId, 'blind');
      expect(restored.type, AccessibilityProfileType.blind);
      expect(restored.ttsEnabled, true);
      expect(restored.ttsRate, 1.5);
      expect(restored.baselineHaptic, HapticIntensity.medium);
      expect(restored.morseMode, true);
    });

    test('DetectedObject toJson/fromJson', () {
      const obj = DetectedObject(
        label: 'chair',
        confidence: 0.87,
        distanceMeters: 1.2,
        relativePosition: 'left',
      );
      final json = obj.toJson();
      final restored = DetectedObject.fromJson(json);
      expect(restored.label, 'chair');
      expect(restored.confidence, 0.87);
      expect(restored.distanceMeters, 1.2);
      expect(restored.relativePosition, 'left');
    });

    test('NavigationEventPayload equality and copyWith', () {
      const a = NavigationEventPayload(
        mode: 'silence',
        targetId: 0,
        accessibilityModeActive: false,
        parameters: {},
      );
      final b = a.copyWith(mode: 'obstacle_detection');
      expect(b.mode, 'obstacle_detection');
      expect(b.targetId, 0);
      expect(a.mode, 'silence');
    });
  });

  group('SentraEventType constants', () {
    test('all type constants are unique strings', () {
      final types = [
        SentraEventType.navigation,
        SentraEventType.cameraFrame,
        SentraEventType.haptic,
        SentraEventType.tts,
        SentraEventType.profileChanged,
        SentraEventType.error,
        SentraEventType.alertDispatch,
      ];
      expect(types.toSet().length, types.length);
    });
  });
}
