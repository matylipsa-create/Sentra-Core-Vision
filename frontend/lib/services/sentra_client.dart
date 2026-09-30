import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:web_socket_channel/web_socket_channel.dart';
import '../config/constants.dart';
import '../models/tcrei_models.dart';

/// Cliente de comunicacion con el backend Sentra Core.
///
/// Mantiene una conexion WebSocket persistente para eventos en tiempo real
/// y un cliente HTTP para consultas REST puntuales.
class SentraClient {
  SentraClient({String? apiToken}) : _apiToken = apiToken?.trim();

  WebSocketChannel? _channel;
  StreamSubscription? _wsSub;
  bool _connected = false;
  int _reconnectAttempts = 0;
  Timer? _reconnectTimer;
  String? _apiToken;
  bool _authRejected = false;

  final _responseController = StreamController<TCREIResponse>.broadcast();
  final _eventController = StreamController<TCREIEventData>.broadcast();
  final _connectionController = StreamController<bool>.broadcast();

  /// Stream de respuestas a comandos/queries.
  Stream<TCREIResponse> get responses => _responseController.stream;

  /// Stream de eventos push del backend.
  Stream<TCREIEventData> get events => _eventController.stream;

  /// Stream de cambios de conexion.
  Stream<bool> get connectionChanges => _connectionController.stream;

  /// Si esta conectado al backend.
  bool get isConnected => _connected;

  /// Actualiza credenciales obtenidas desde almacenamiento seguro de la app.
  void setApiToken(String? token) {
    _apiToken = token?.trim();
    _authRejected = false;
    disconnect();
    connect();
  }

  /// Conectar al WebSocket del backend.
  void connect() {
    if (_channel != null) return;
    if (!(_apiToken?.isNotEmpty ?? false)) {
      _connected = false;
      _connectionController.add(false);
      return;
    }
    try {
      _channel = WebSocketChannel.connect(
        Uri.parse(SentraConstants.wsUrl),
      );
      _wsSub = _channel!.stream.listen(
        _onData,
        onError: (error) => _onError(error),
        onDone: _onDone,
      );
      if (_apiToken?.isNotEmpty ?? false) {
        _channel!.sink.add(jsonEncode(TCREIMessage.auth(_apiToken!).toJson()));
      } else {
        _connected = false;
        _connectionController.add(false);
      }
    } catch (e) {
      _scheduleReconnect();
    }
  }

  /// Desconectar.
  void disconnect() {
    _reconnectTimer?.cancel();
    _wsSub?.cancel();
    _channel?.sink.close();
    _channel = null;
    _connected = false;
    _connectionController.add(false);
  }

  /// Enviar un mensaje al backend.
  void send(TCREIMessage message) {
    if (_channel != null && _connected) {
      _channel!.sink.add(jsonEncode(message.toJson()));
    }
  }

  /// Enviar un comando y esperar la respuesta.
  Future<TCREIResponse> sendCommand(TCREIMessage message, {Duration timeout = const Duration(seconds: 10)}) {
    final response = responses
        .where((r) => r.id == message.id)
        .first
        .timeout(timeout, onTimeout: () => TCREIResponse(
              id: message.id,
              ok: false,
              error: 'Timeout',
              timestamp: DateTime.now().millisecondsSinceEpoch,
            ));
    send(message);
    return response;
  }

  // ─── REST API ─────────────────────────────────────

  Future<Map<String, dynamic>> getStatus() => _get('status');
  Future<Map<String, dynamic>> getModules() => _get('modules');
  Future<Map<String, dynamic>> getEvidence() => _get('evidence');
  Future<Map<String, dynamic>> getBioProtocols() => _get('bio/protocols');
  Future<Map<String, dynamic>> getBioState() => _get('bio/state');
  Future<Map<String, dynamic>> getBioStats() => _get('bio/stats');
  Future<Map<String, dynamic>> getGuardianStatus() => _get('guardian/status');

  Future<Map<String, dynamic>> verifyEvidence() => _post('evidence/verify', {});

  Future<Map<String, dynamic>> sendCommandREST(String command, {String perception = 'Sin percepcion activa'}) =>
      _post('command', {'command': command, 'perception': perception});

  Future<Map<String, dynamic>> updateSetting(String key, dynamic value) =>
      _post('settings', {'key': key, 'value': value});

  // ─── Internal ─────────────────────────────────────

  Future<Map<String, dynamic>> _get(String route) async {
    final res = await http.get(Uri.parse('${SentraConstants.apiUrl}/$route'), headers: _authHeaders());
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> _post(String route, Map<String, dynamic> body) async {
    final res = await http.post(
      Uri.parse('${SentraConstants.apiUrl}/$route'),
      headers: {'Content-Type': 'application/json', ..._authHeaders()},
      body: jsonEncode(body),
    );
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  // ─── Public REST helpers for screens ──────────────

  Future<Map<String, dynamic>> getRoute(String route) => _get(route);
  Future<Map<String, dynamic>> postRoute(String route, Map<String, dynamic> body) => _post(route, body);

  Map<String, String> _authHeaders() {
    final token = _apiToken;
    return token == null || token.isEmpty ? {} : {'Authorization': 'Bearer $token'};
  }

  void _onData(dynamic data) {
    try {
      final json = jsonDecode(data as String) as Map<String, dynamic>;
      if (json['type'] == 'auth') {
        final payload = json['payload'] is Map<String, dynamic>
            ? json['payload'] as Map<String, dynamic>
            : const <String, dynamic>{};
        final authenticated = json['ok'] == true || payload['ok'] == true;
        _connected = authenticated;
        _authRejected = !authenticated;
        _reconnectAttempts = 0;
        _connectionController.add(authenticated);
        if (!authenticated) _channel?.sink.close();
        return;
      }
      if (json['type'] == 'event') {
        _eventController.add(TCREIEventData.fromJson(json));
      } else {
        _responseController.add(TCREIResponse.fromJson(json));
      }
    } catch (_) {
      // invalid JSON, ignore
    }
  }

  void _onError(Object error) {
    _connected = false;
    _connectionController.add(false);
    if (!_authRejected) _scheduleReconnect();
  }

  void _onDone() {
    _connected = false;
    _connectionController.add(false);
    _channel = null;
    if (!_authRejected) _scheduleReconnect();
  }

  void _scheduleReconnect() {
    if (_reconnectAttempts >= SentraConstants.maxReconnectAttempts) return;
    _reconnectAttempts++;
    final delay = Duration(
      seconds: SentraConstants.reconnectBaseDelaySec * _reconnectAttempts,
    );
    _reconnectTimer = Timer(delay, () => connect());
  }

  void dispose() {
    disconnect();
    _responseController.close();
    _eventController.close();
    _connectionController.close();
  }
}
