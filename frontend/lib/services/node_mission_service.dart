import 'dart:async';

import 'package:flutter/foundation.dart';

import '../models/node_mission_model.dart';
import 'event_bus.dart';
import 'supabase_tactical_client.dart';

/// Manages the collection of geographic mission nodes.
///
/// Loads missions from Supabase, marks expired ones, and publishes
/// [MissionUpdatedEvent] when a mission's status changes.
class NodeMissionService extends ChangeNotifier {
  final SentraEventBus _bus;
  final SupabaseTacticalClient _client;

  List<NodeMission> _missions = [];
  bool _isLoading = false;

  NodeMissionService({
    SentraEventBus? bus,
    SupabaseTacticalClient? client,
  })  : _bus = bus ?? EventBusProvider.instance,
        _client = client ?? SupabaseTacticalClient();

  List<NodeMission> get missions => List.unmodifiable(_missions);
  List<NodeMission> get activeMissions =>
      _missions.where((m) => m.isActive).toList(growable: false);
  bool get isLoading => _isLoading;

  /// Loads all missions from Supabase and marks expired ones.
  Future<void> loadMissions() async {
    _isLoading = true;
    notifyListeners();
    try {
      final rows = await _client.select('node_mission');
      _missions = rows.map((r) => NodeMission.fromJson(r)).toList();
      _checkExpired();
    } catch (_) {
      // Supabase not reachable — continue with empty list.
    }
    _isLoading = false;
    notifyListeners();
  }

  /// Creates a new mission node and persists it.
  Future<NodeMission?> createMission({
    required String title,
    required String description,
    required double latitude,
    required double longitude,
    int breachIntensity = 1,
  }) async {
    final now = DateTime.now();
    try {
      final row = await _client.insert('node_mission', {
        'title': title,
        'description': description,
        'latitude': latitude,
        'longitude': longitude,
        'breach_intensity': breachIntensity,
        'status': 'ACTIVE',
        'expires_at': now
            .add(NodeMission.expirationWindow)
            .toIso8601String(),
      });
      final mission = NodeMission.fromJson(row);
      _missions = [..._missions, mission];
      notifyListeners();
      return mission;
    } catch (_) {
      return null;
    }
  }

  /// Marks a mission as completed and updates Supabase.
  Future<void> completeMission(String missionId) async {
    try {
      await _client.update(
        'node_mission',
        {'status': 'COMPLETED'},
        'id=eq.$missionId',
      );
      _missions = _missions.map((m) {
        if (m.id == missionId) {
          return m.copyWith(status: NodeMissionStatus.completed);
        }
        return m;
      }).toList();
      notifyListeners();
      _bus.publishWithClock(
          (ts) => MissionUpdatedEvent(missionId, 'COMPLETED', ts));
    } catch (_) {
      // Offline — update locally only.
      _missions = _missions.map((m) {
        if (m.id == missionId) {
          return m.copyWith(status: NodeMissionStatus.completed);
        }
        return m;
      }).toList();
      notifyListeners();
    }
  }

  /// Checks for expired missions and updates their status.
  void _checkExpired() {
    final now = DateTime.now();
    for (final m in _missions) {
      if (m.status == NodeMissionStatus.active && m.isExpired) {
        _client.update(
          'node_mission',
          {'status': 'EXPIRED'},
          'id=eq.${m.id}',
        );
        _bus.publishWithClock(
            (ts) => MissionUpdatedEvent(m.id, 'EXPIRED', ts));
      }
    }
    _missions = _missions.map((m) {
      if (m.status == NodeMissionStatus.active && m.isExpired) {
        return m.copyWith(status: NodeMissionStatus.expired);
      }
      return m;
    }).toList();
  }
}
