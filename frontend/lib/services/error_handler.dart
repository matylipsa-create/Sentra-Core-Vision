import 'dart:async';

import 'event_bus.dart';

/// Central error handler that emits structured JSON error events on the bus.
///
/// All services route exceptions through [ErrorHandler.report] so the UI can
/// surface a consistent error state and the alert dispatcher can forward
/// critical failures if needed.
class ErrorHandler {
  final SentraEventBus _bus;
  final List<Map<String, dynamic>> _recentErrors = [];
  static const int _maxRecent = 20;

  ErrorHandler({SentraEventBus? bus})
      : _bus = bus ?? EventBusProvider.instance;

  List<Map<String, dynamic>> get recentErrors =>
      List.unmodifiable(_recentErrors);

  /// Reports an error and emits a JSON error event on the bus.
  ///
  /// [severity] — 'critical', 'warning', or 'info'.
  /// [source] — the service or module that raised the error.
  /// [code] — a short machine-readable error code.
  void report(
    String message, {
    String severity = 'warning',
    String source = 'unknown',
    String code = 'unknown',
    Object? error,
    StackTrace? stack,
  }) {
    final errorPayload = <String, dynamic>{
      'message': message,
      'severity': severity,
      'source': source,
      'code': code,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      if (error != null) 'error': error.toString(),
      if (stack != null) 'stackTrace': stack.toString(),
    };

    _recentErrors.add(errorPayload);
    if (_recentErrors.length > _maxRecent) {
      _recentErrors.removeAt(0);
    }

    _bus.emit(SentraEventType.error, errorPayload);
  }

  /// Wraps an async function, catching and reporting any error.
  Future<void> guard(
    Future<void> Function() action, {
    String source = 'unknown',
    String code = 'unknown',
  }) async {
    try {
      await action();
    } catch (e, st) {
      report(
        'Error in $source: $e',
        severity: 'critical',
        source: source,
        code: code,
        error: e,
        stack: st,
      );
    }
  }

  void clearRecent() => _recentErrors.clear();
}
