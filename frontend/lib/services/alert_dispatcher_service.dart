import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import 'event_bus.dart';

/// Offline-first alert dispatch service.
///
/// Sends geolocated alert payloads (operator callsign, node_id, coordinates,
/// mind_state, timestamp) to a configurable webhook URL (e.g. a Telegram bot
/// gateway or any HTTP webhook). On network failure, returns false and queues
/// the payload locally for later retry via [flushQueue].
class AlertDispatcherService extends ChangeNotifier {
  final SentraEventBus _bus;
  final String _webhookUrl;

  final List<Map<String, dynamic>> _queue = [];
  bool _dispatching = false;

  AlertDispatcherService({
    SentraEventBus? bus,
    String? webhookUrl,
  })  : _bus = bus ?? EventBusProvider.instance,
        _webhookUrl = webhookUrl ??
            const String.fromEnvironment(
              'SENTRA_ALERT_WEBHOOK_URL',
              defaultValue: '',
            );

  List<Map<String, dynamic>> get queuedAlerts => List.unmodifiable(_queue);
  int get queueLength => _queue.length;
  bool get isDispatching => _dispatching;

  /// Dispatches an alert payload to the webhook.
  ///
  /// Returns true on success, false on network failure (payload is queued
  /// for later retry).
  Future<bool> dispatch({
    required String operatorCallsign,
    required String nodeId,
    required double latitude,
    required double longitude,
    required String mindState,
    String source = 'sentra_vision',
  }) async {
    final payload = {
      'source': source,
      'operator': operatorCallsign,
      'node_id': nodeId,
      'coordinates': {
        'lat': latitude,
        'lng': longitude,
      },
      'mind_state': mindState,
      'timestamp': DateTime.now().toUtc().toIso8601String(),
    };

    return _send(payload);
  }

  /// Attempts to flush all queued alerts. Returns the number successfully sent.
  Future<int> flushQueue() async {
    if (_queue.isEmpty) return 0;
    int sent = 0;
    final toFlush = List<Map<String, dynamic>>.from(_queue);
    for (final payload in toFlush) {
      final success = await _send(payload, enqueueOnFailure: false);
      if (success) {
        _queue.remove(payload);
        sent++;
      } else {
        break;
      }
    }
    notifyListeners();
    return sent;
  }

  Future<bool> _send(
    Map<String, dynamic> payload, {
    bool enqueueOnFailure = true,
  }) async {
    if (_webhookUrl.isEmpty) {
      if (enqueueOnFailure) _queue.add(payload);
      notifyListeners();
      return false;
    }

    _dispatching = true;
    notifyListeners();

    try {
      final res = await http.post(
        Uri.parse(_webhookUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 10));

      _dispatching = false;
      notifyListeners();

      if (res.statusCode >= 200 && res.statusCode < 300) {
        return true;
      }
      if (enqueueOnFailure) _queue.add(payload);
      notifyListeners();
      return false;
    } catch (_) {
      _dispatching = false;
      if (enqueueOnFailure) _queue.add(payload);
      notifyListeners();
      return false;
    }
  }

  void dispose() {
    _queue.clear();
  }
}
