import 'dart:math' as math;

import 'package:flutter/foundation.dart';

/// Status of a geographic mission node.
enum NodeMissionStatus { active, completed, expired }

/// Immutable model for a geographic mission node.
///
/// Each node has a physical location (lat/lng), a breach intensity (1–10)
/// that affects operator mental stability when engaged, and a 48-hour
/// expiration window from creation.
@immutable
class NodeMission {
  final String id;
  final String title;
  final String description;
  final double latitude;
  final double longitude;
  final int breachIntensity;
  final NodeMissionStatus status;
  final DateTime expiresAt;
  final DateTime createdAt;

  static const Duration expirationWindow = Duration(hours: 48);

  const NodeMission({
    required this.id,
    required this.title,
    required this.description,
    required this.latitude,
    required this.longitude,
    this.breachIntensity = 1,
    this.status = NodeMissionStatus.active,
    required this.expiresAt,
    required this.createdAt,
  });

  /// Whether this mission has expired based on the current time.
  bool get isExpired => DateTime.now().isAfter(expiresAt);

  /// Whether this mission is still active and not expired.
  bool get isActive => status == NodeMissionStatus.active && !isExpired;

  /// Breach exposure applied to operator stability when engaging this node.
  double get breachExposure => breachIntensity.toDouble();

  /// Distance in meters from a given coordinate (Haversine formula).
  double distanceFrom(double lat, double lng) {
    const double earthRadius = 6371000.0;
    final dLat = _toRadians(lat - latitude);
    final dLng = _toRadians(lng - longitude);
    final a = (0.5 -
            0.5 *
                math.cos(dLat) +
            math.cos(_toRadians(lat)) *
                math.cos(_toRadians(latitude)) *
                (0.5 - 0.5 * math.cos(dLng)));
    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return earthRadius * c;
  }

  NodeMission copyWith({
    String? id,
    String? title,
    String? description,
    double? latitude,
    double? longitude,
    int? breachIntensity,
    NodeMissionStatus? status,
    DateTime? expiresAt,
    DateTime? createdAt,
  }) {
    return NodeMission(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      breachIntensity: breachIntensity ?? this.breachIntensity,
      status: status ?? this.status,
      expiresAt: expiresAt ?? this.expiresAt,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  factory NodeMission.fromJson(Map<String, dynamic> json) {
    return NodeMission(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      breachIntensity: (json['breach_intensity'] as num?)?.toInt() ?? 1,
      status: _parseStatus(json['status'] as String? ?? 'ACTIVE'),
      expiresAt: DateTime.parse(json['expires_at'] as String),
      createdAt: DateTime.parse(json['created_at'] as String? ??
          DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'latitude': latitude,
        'longitude': longitude,
        'breach_intensity': breachIntensity,
        'status': _statusString(status),
        'expires_at': expiresAt.toIso8601String(),
        'created_at': createdAt.toIso8601String(),
      };

  static NodeMissionStatus _parseStatus(String s) {
    switch (s.toUpperCase()) {
      case 'COMPLETED':
        return NodeMissionStatus.completed;
      case 'EXPIRED':
        return NodeMissionStatus.expired;
      default:
        return NodeMissionStatus.active;
    }
  }

  static String _statusString(NodeMissionStatus s) {
    switch (s) {
      case NodeMissionStatus.active:
        return 'ACTIVE';
      case NodeMissionStatus.completed:
        return 'COMPLETED';
      case NodeMissionStatus.expired:
        return 'EXPIRED';
    }
  }

  // Trigonometry helper.
  static double _toRadians(double deg) => deg * 0.017453292519943295;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is NodeMission && other.id == id);

  @override
  int get hashCode => id.hashCode;
}
