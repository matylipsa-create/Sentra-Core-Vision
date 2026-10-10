import 'dart:async';

import '../interfaces/hardware_interfaces.dart';
import '../locator.dart';
import '../models/navigation_payloads.dart';
import 'event_bus.dart';

/// Executes rhythmic haptic feedback patterns, including Morse-style
/// vibrations for the deaf-blind profile and proximity-scaled pulses
/// from the camera duty cycle controller.
///
/// Delegates all native vibration calls to the [IHapticService] adapter
/// registered in [ServiceLocator], making it fully platform-agnostic.
/// Listens to `haptic` events on the bus and translates each [HapticPayload]
/// into a timed sequence of vibration bursts.
class HapticFeedbackService {
  final SentraEventBus _bus;
  final IHapticService _engine;
  StreamSubscription<SentraEvent>? _subscription;
  bool _active = false;

  HapticFeedbackService({SentraEventBus? bus, IHapticService? engine})
      : _bus = bus ?? EventBusProvider.instance,
        _engine = engine ?? ServiceLocator.haptic;

  bool get isActive => _active;

  void start() {
    if (_active) return;
    _active = true;
    _subscription = _bus.on(SentraEventType.haptic).listen(_handleEvent);
  }

  void stop() {
    _active = false;
    _subscription?.cancel();
    _subscription = null;
  }

  void _handleEvent(SentraEvent event) {
    final payload = HapticPayload.fromJson(
      Map<String, dynamic>.from(event.payload),
    );
    _playPattern(payload);
  }

  Future<void> playPattern(HapticPayload payload) async {
    await _playPattern(payload);
  }

  Future<void> _playPattern(HapticPayload payload) async {
    for (final durationMs in payload.pattern) {
      switch (payload.intensity) {
        case HapticIntensity.light:
          await _engine.lightImpact();
          break;
        case HapticIntensity.medium:
          await _engine.mediumImpact();
          break;
        case HapticIntensity.strong:
          await _engine.heavyImpact();
          break;
        case HapticIntensity.critical:
          await _engine.vibrate();
          break;
      }
      await Future<void>.delayed(Duration(milliseconds: durationMs));
    }
  }

  /// Encodes a text message into Morse-code haptic patterns.
  ///
  /// Dot = short vibration (150 ms), Dash = long vibration (400 ms).
  /// Used by the deaf-blind profile to convey short messages via touch.
  Future<void> playMorse(String text) async {
    final morse = _textToMorse(text);
    for (final symbol in morse.split('')) {
      if (symbol == '.') {
        await _engine.lightImpact();
        await Future<void>.delayed(const Duration(milliseconds: 150));
      } else if (symbol == '-') {
        await _engine.mediumImpact();
        await Future<void>.delayed(const Duration(milliseconds: 400));
      } else if (symbol == ' ') {
        await Future<void>.delayed(const Duration(milliseconds: 700));
      }
    }
  }

  void dispose() {
    stop();
  }

  static const Map<String, String> _morseTable = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
    'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
    'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
    'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
    'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
    'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....', '6': '-....',
    '7': '--...', '8': '---..', '9': '----.',
  };

  static String _textToMorse(String text) {
    final buffer = StringBuffer();
    for (int i = 0; i < text.length; i++) {
      final char = text[i].toUpperCase();
      if (char == ' ') {
        buffer.write(' ');
      } else {
        final code = _morseTable[char];
        if (code != null) {
          buffer.write(code);
          if (i < text.length - 1) buffer.write(' ');
        }
      }
    }
    return buffer.toString();
  }
}
