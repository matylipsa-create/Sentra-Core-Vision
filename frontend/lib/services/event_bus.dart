import 'dart:async';
import 'dart:convert';

/// Event type constants for the JSON event bus.
class SentraEventType {
  SentraEventType._();

  static const String navigation = 'navigation';
  static const String cameraFrame = 'camera_frame';
  static const String haptic = 'haptic';
  static const String tts = 'tts';
  static const String profileChanged = 'profile_changed';
  static const String error = 'error';
  static const String alertDispatch = 'alert_dispatch';
}

/// Ultralight immutable JSON event envelope.
///
/// Every event on the bus is a `Map<String, dynamic>` with:
/// - `type` — string discriminator (see [SentraEventType])
/// - `timestamp` — milliseconds since epoch
/// - `payload` — immutable `Map<String, dynamic>` with type-specific fields
///
/// Producers and consumers never hold references to each other; they only
/// share the bus and the JSON contract.
class SentraEvent {
  final String type;
  final int timestamp;
  final Map<String, dynamic> payload;

  const SentraEvent({
    required this.type,
    required this.timestamp,
    required this.payload,
  });

  Map<String, dynamic> toJson() => {
        'type': type,
        'timestamp': timestamp,
        'payload': Map<String, dynamic>.from(payload),
      };

  @override
  String toString() => jsonEncode(toJson());

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SentraEvent &&
          other.type == type &&
          other.timestamp == timestamp &&
          _mapEquals(other.payload, payload));

  @override
  int get hashCode => Object.hash(type, timestamp, payload);

  static bool _mapEquals(Map<String, dynamic> a, Map<String, dynamic> b) {
    if (a.length != b.length) return false;
    for (final key in a.keys) {
      if (!b.containsKey(key) || a[key] != b[key]) return false;
    }
    return true;
  }
}

/// Helper to build a [SentraEvent] with the current clock.
SentraEvent sentraEvent(
  String type,
  Map<String, dynamic> payload, [
  int? timestamp,
]) =>
    SentraEvent(
      type: type,
      timestamp: timestamp ?? DateTime.now().millisecondsSinceEpoch,
      payload: Map<String, dynamic>.from(payload),
    );

/// Global decoupled event bus using ultralight JSON payloads.
///
/// Sensors (camera, voice, TTS) publish [SentraEvent]s; UI and services
/// subscribe to the event types they care about via [on].
class SentraEventBus {
  final StreamController<SentraEvent> _controller =
      StreamController<SentraEvent>.broadcast();

  Stream<SentraEvent> get stream => _controller.stream;

  /// Stream filtered to events of the given [type].
  Stream<SentraEvent> on(String type) =>
      _controller.stream.where((e) => e.type == type);

  /// Publish a JSON event on the bus.
  void publish(SentraEvent event) {
    if (!_controller.isClosed) _controller.add(event);
  }

  /// Convenience: build and publish in one call.
  void emit(
    String type,
    Map<String, dynamic> payload, [
    int? timestamp,
  ]) =>
      publish(sentraEvent(type, payload, timestamp));

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
  final List<StreamSubscription<SentraEvent>> _subs = [];

  void add(StreamSubscription<SentraEvent> sub) => _subs.add(sub);

  Future<void> cancelAll() async {
    await Future.wait(_subs.map((s) => s.cancel()));
    _subs.clear();
  }
}
