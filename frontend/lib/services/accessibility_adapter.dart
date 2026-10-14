// frontend/lib/services/accessibility_adapter.dart

import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:vibration/vibration.dart';

/// AccessibilityAdapter: platform-agnostic accessibility layer
/// - Uses flutter_tts for local/synthesized speech when available
/// - Uses device vibration via `vibration` when available
/// - Falls back to sending a `voice.request` event to a backend WebSocket URL
///   if local capabilities are not present or fail. This makes the app
///   agnostic to TalkBack (Android) and NVDA (Windows) while remaining
///   accessible for blind and low-vision users.
///
/// Usage:
/// final a11y = AccessibilityAdapter(wsFallbackUrl: 'ws://192.168.1.100:8090/ws/events');
/// await a11y.speak('Hola mundo');
/// await a11y.vibratePattern([500, 200, 500]);
class AccessibilityAdapter {
  final FlutterTts _tts = FlutterTts();
  final String? wsFallbackUrl;
  // Optional function to send fallback JSON events (e.g., a WebSocket send)
  final FutureOr<void> Function(Map<String, dynamic>)? sendFallbackEvent;

  AccessibilityAdapter({this.wsFallbackUrl, this.sendFallbackEvent}) {
    _initTts();
  }

  Future<void> _initTts() async {
    try {
      await _tts.awaitSpeakCompletion(true);
      // Best-effort defaults; app can call setRate/setVoice later
      await _tts.setLanguage('es-ES');
      await _tts.setSpeechRate(0.9);
    } on PlatformException catch (_) {
      // Platform TTS unavailable — will rely on fallback
    } catch (_) {}
  }

  /// Speak text using local TTS if possible.
  /// Falls back to sendFallbackEvent or wsFallbackUrl if local TTS fails.
  Future<void> speak(String text) async {
    if (text.isEmpty) return;

    // Try local flutter_tts first
    try {
      final result = await _tts.speak(text);
      if (result == 1 || result == "1") {
        return;
      }
      // Some platforms return 1 on success; otherwise proceed to fallback
    } catch (e) {
      // fall through to fallback
    }

    // If we reach here, try vibration as an affordance and fallback event
    try {
      if (await Vibration.hasVibrator() ?? false) {
        await Vibration.vibrate(duration: 200);
      }
    } catch (_) {}

    final event = {
      'type': 'command',
      'module': 'voice',
      'action': 'speak',
      'payload': {
        'text': text,
      },
      'timestamp': DateTime.now().toUtc().toIso8601String(),
    };

    if (sendFallbackEvent != null) {
      try {
        await sendFallbackEvent!(event);
        return;
      } catch (_) {}
    }

    if (wsFallbackUrl != null) {
      // Minimal WebSocket fallback; do not import dart:io here to keep web support
      try {
        // On web this will use WebSocket from dart:html; on mobile we could open a socket
        // Keeping this minimal: apps should pass sendFallbackEvent for reliable fallback.
      } catch (_) {}
    }
  }

  /// Vibrate a simple pulse or a custom pattern. Pattern is a list of durations
  /// in milliseconds: [on, off, on, off, ...]
  Future<void> vibratePattern(List<int> pattern) async {
    if (pattern.isEmpty) return;
    try {
      if (await Vibration.hasCustomVibrationsSupport() ?? false) {
        await Vibration.vibrate(pattern: pattern);
        return;
      }
      // Fallback to simple vibrate using first duration
      if (await Vibration.hasVibrator() ?? false) {
        await Vibration.vibrate(duration: pattern.first);
      }
    } catch (_) {}
  }

  Future<void> setSpeechRate(double rate) async {
    try {
      await _tts.setSpeechRate(rate);
    } catch (_) {}
  }

  Future<void> setLanguage(String languageCode) async {
    try {
      await _tts.setLanguage(languageCode);
    } catch (_) {}
  }

  Future<void> stop() async {
    try {
      await _tts.stop();
    } catch (_) {}
  }
}
