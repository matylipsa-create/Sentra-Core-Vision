import 'dart:async';

import '../models/navigation_payloads.dart';

/// Marker interface for every event that flows through the bus.
abstract class SentraEvent {
  int get timestamp;
}

class NavigationEvent extends SentraEvent {
  final NavigationEventPayload payload;
  @override
  final int timestamp;
  NavigationEvent(this.payload, this.timestamp);
}

class CameraFrameEvent extends SentraEvent {
  final CameraFramePayload payload;
  @override
  final int timestamp;
  CameraFrameEvent(this.payload, this.timestamp);
}

class HapticEvent extends SentraEvent {
  final HapticPayload payload;
  @override
  final int timestamp;
  HapticEvent(this.payload, this.timestamp);
}

class TtsEvent extends SentraEvent {
  final TtsPayload payload;
  @override
  final int timestamp;
  TtsEvent(this.payload, this.timestamp);
}

class ProfileChangedEvent extends SentraEvent {
  final String profileId;
  final AccessibilityProfileType type;
  @override
  final int timestamp;
  ProfileChangedEvent(this.profileId, this.type, this.timestamp);
}

class MindStateChangedEvent extends SentraEvent {
  final double stability;
  final String stateMode;
  final double breachExposure;
  @override
  final int timestamp;
  MindStateChangedEvent(
      this.stability, this.stateMode, this.breachExposure, this.timestamp);
}

class MissionUpdatedEvent extends SentraEvent {
  final String missionId;
  final String status;
  @override
  final int timestamp;
  MissionUpdatedEvent(this.missionId, this.status, this.timestamp);
}

class ItemCraftedEvent extends SentraEvent {
  final String itemKey;
  final String displayName;
  final int lootCost;
  @override
  final int timestamp;
  ItemCraftedEvent(
      this.itemKey, this.displayName, this.lootCost, this.timestamp);
}

/// Global decoupled event bus. Sensors (camera, voice, TTS) publish events;
/// UI and services subscribe to the payload types they care about.
///
/// This is the Dart equivalent of the C# event + JSON payload pattern used
/// in the Godot motor: producers and consumers never hold references to each
/// other, they only share the bus and the payload contract.
class SentraEventBus {
  final StreamController<SentraEvent> _controller =
      StreamController<SentraEvent>.broadcast();

  Stream<SentraEvent> get stream => _controller.stream;

  /// Typed stream filtered to events whose runtime type is [T].
  Stream<T> on<T extends SentraEvent>() =>
      _controller.stream.where((e) => e is T).cast<T>();

  void publish(SentraEvent event) {
    if (!_controller.isClosed) _controller.add(event);
  }

  void publishWithClock(SentraEvent Function(int timestamp) factory) {
    publish(factory(DateTime.now().millisecondsSinceEpoch));
  }

  Future<void> dispose() async => _controller.close();

  bool get isClosed => _controller.isClosed;
}

/// Singleton accessor so sensors and UI share one bus without DI wiring.
class EventBusProvider {
  EventBusProvider._();
  static SentraEventBus? _instance;

  static SentraEventBus get instance => _instance ??= SentraEventBus();

  static void reset() {
    _instance?.dispose();
    _instance = SentraEventBus();
  }
}

/// Holds subscriptions so listeners can be cancelled in bulk.
class EventSubscriptions {
  final List<StreamSubscription> _subs = [];

  void add(StreamSubscription sub) => _subs.add(sub);

  Future<void> cancelAll() async {
    await Future.wait(_subs.map((s) => s.cancel()));
    _subs.clear();
  }
}
