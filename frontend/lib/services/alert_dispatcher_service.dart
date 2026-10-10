import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';

import 'event_bus.dart';

/// Offline-first alert dispatch service for emergency location alerts.
///
/// Sends geolocated alert payloads (user ID, coordinates, timestamp) to a
/// configurable webhook URL. On network failure, returns false and queues
/// the payload locally for later retry via [flushQueue].
///
/// Uses [HttpClient] from dart:io — no external HTTP dependency required.
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

  /// Dispatches an emergency alert with geolocation to the webhook.
  ///
  /// Returns true on success, false on network failure (payload is queued
  /// for later retry).
  Future<bool> dispatch({
    required String userId,
    required double latitude,
    required double longitude,
    String source = 'sentra_vision',
  }) async {
    final payload = {
      'source': source,
      'user_id': userId,
      'coordinates': {
        'lat': latitude,
        'lng': longitude,
      },
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
      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 10);
      final uri = Uri.parse(_webhookUrl);
      final request = await client.postUrl(uri);
      request.headers.contentType = ContentType.json;
      request.write(jsonEncode(payload));
      final response = await request.close().timeout(
        const Duration(seconds: 10),
      );
      final statusCode = response.statusCode;
      await response.drain<void>();
      client.close();

      _dispatching = false;
      notifyListeners();

      if (statusCode >= 200 && statusCode < 300) {
        _bus.emit(SentraEventType.alertDispatch, {
          'status': 'sent',
          'payload': payload,
        });
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

  @override
  void dispose() {
    _queue.clear();
    super.dispose();
  }
}
