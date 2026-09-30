/// Modelos TCREI para la comunicacion con el backend Sentra Core.

enum TCREIMessageType { telemetry, command, event, auth, ack, query, response, error }

enum TCREIEvent {
  perceptionUpdate,
  bioTick,
  bioSessionComplete,
  guardianAlert,
  guardianStateChange,
  evidenceRecorded,
  moralBlocked,
  voiceResponse,
  connectionStatus,
  bioSessionStarted,
}

class TCREIMessage {
  final TCREIMessageType type;
  final String module;
  final String action;
  final Map<String, dynamic> payload;
  final int timestamp;
  final String id;
  final String? signature;

  TCREIMessage({
    required this.type,
    required this.module,
    required this.action,
    required this.payload,
    required this.timestamp,
    required this.id,
    this.signature,
  });

  Map<String, dynamic> toJson() => {
        'type': type.name,
        'module': module,
        'action': action,
        'payload': payload,
        'timestamp': timestamp,
        'id': id,
        if (signature != null) 'signature': signature,
      };

  factory TCREIMessage.fromJson(Map<String, dynamic> json) {
    return TCREIMessage(
      type: TCREIMessageType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => TCREIMessageType.command,
      ),
      module: json['module'] as String? ?? 'system',
      action: json['action'] as String? ?? '',
      payload: json['payload'] as Map<String, dynamic>? ?? {},
      timestamp: json['timestamp'] as int? ?? DateTime.now().millisecondsSinceEpoch,
      id: json['id'] as String? ?? '',
      signature: json['signature'] as String?,
    );
  }

  static TCREIMessage command({
    required String module,
    required String action,
    Map<String, dynamic> payload = const {},
  }) {
    return TCREIMessage(
      type: TCREIMessageType.command,
      module: module,
      action: action,
      payload: payload,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      id: _uuid(),
    );
  }

  static TCREIMessage query({
    required String module,
    required String action,
    Map<String, dynamic> payload = const {},
  }) {
    return TCREIMessage(
      type: TCREIMessageType.query,
      module: module,
      action: action,
      payload: payload,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      id: _uuid(),
    );
  }

  static TCREIMessage telemetry({
    required String module,
    required String action,
    Map<String, dynamic> payload = const {},
    String? signature,
  }) {
    return TCREIMessage(
      type: TCREIMessageType.telemetry,
      module: module,
      action: action,
      payload: payload,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      id: _uuid(),
      signature: signature,
    );
  }

  static TCREIMessage auth(String token) {
    return TCREIMessage(
      type: TCREIMessageType.auth,
      module: 'system',
      action: 'authenticate',
      payload: {'token': token},
      timestamp: DateTime.now().millisecondsSinceEpoch,
      id: _uuid(),
    );
  }

  static String _uuid() {
    return DateTime.now().microsecondsSinceEpoch.toRadixString(16) +
        (DateTime.now().millisecond).toRadixString(16);
  }
}

class TCREIResponse {
  final String id;
  final bool ok;
  final dynamic data;
  final String? error;
  final int timestamp;

  TCREIResponse({
    required this.id,
    required this.ok,
    this.data,
    this.error,
    required this.timestamp,
  });

  factory TCREIResponse.fromJson(Map<String, dynamic> json) {
    final ackPayload = json['payload'] is Map<String, dynamic>
        ? json['payload'] as Map<String, dynamic>
        : const <String, dynamic>{};
    final isAck = json['type'] == 'ack';
    return TCREIResponse(
      id: json['id'] as String? ?? '',
      ok: (isAck ? ackPayload['ok'] : json['ok']) as bool? ?? false,
      data: isAck ? ackPayload['data'] : json['data'],
      error: (isAck ? ackPayload['error'] : json['error']) as String?,
      timestamp: json['timestamp'] as int? ?? 0,
    );
  }
}

class TCREIEventData {
  final String event;
  final dynamic data;
  final int timestamp;

  TCREIEventData({
    required this.event,
    required this.data,
    required this.timestamp,
  });

  factory TCREIEventData.fromJson(Map<String, dynamic> json) {
    return TCREIEventData(
      event: json['event'] as String? ?? '',
      data: json['data'],
      timestamp: json['timestamp'] as int? ?? 0,
    );
  }
}
