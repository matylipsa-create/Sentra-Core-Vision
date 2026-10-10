import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../config/accessibility_theme.dart';
import '../models/node_mission_model.dart';
import '../models/operator_mind_state.dart';
import '../services/alert_dispatcher_service.dart';
import '../services/haptic_feedback_service.dart';
import '../services/node_mission_service.dart';
import '../services/operator_mind_manager.dart';
import '../services/tts_audio_service.dart';
import '../widgets/accessible_button.dart';

/// High-contrast tactile UI for exploring geographic mission nodes.
///
/// Operators can activate missions, calculate routes (Haversine distance from
/// a reference coordinate), and trigger local breach alerts. Every action
/// produces automatic haptic and voice feedback for accessibility.
class MissionNodeScreen extends StatefulWidget {
  const MissionNodeScreen({super.key});

  @override
  State<MissionNodeScreen> createState() => _MissionNodeScreenState();
}

class _MissionNodeScreenState extends State<MissionNodeScreen> {
  double _refLat = -34.6037;
  double _refLng = -58.3816;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NodeMissionService>().loadMissions();
      context.read<OperatorMindManager>().loadState();
    });
  }

  @override
  Widget build(BuildContext context) {
    final missions = context.watch<NodeMissionService>();
    final mind = context.watch<OperatorMindManager>();

    return Scaffold(
      backgroundColor: AccessibilityTheme.background,
      appBar: AppBar(
        title: const Text('Nodos de Misión'),
      ),
      body: SafeArea(
        child: Semantics(
          container: true,
          label:
              'Pantalla de nodos de misión. ${missions.activeMissions.length} misiones activas. '
              'Seleccione un nodo para activar la misión, calcular ruta o disparar alerta.',
          child: ListView(
            padding: const EdgeInsets.symmetric(
              horizontal: AccessibilityTheme.space3,
              vertical: AccessibilityTheme.space2,
            ),
            children: [
              _OperatorStatusBanner(state: mind.state),
              SizedBox(height: AccessibilityTheme.space2),
              _ReferenceCoordinateCard(
                lat: _refLat,
                lng: _refLng,
                onUpdate: (lat, lng) => setState(() {
                  _refLat = lat;
                  _refLng = lng;
                }),
              ),
              SizedBox(height: AccessibilityTheme.space3),
              Text(
                'Nodos Activos',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              SizedBox(height: AccessibilityTheme.space2),
              if (missions.isLoading)
                const Center(child: CircularProgressIndicator())
              else if (missions.activeMissions.isEmpty)
                Text(
                  'No hay nodos de misión activos.',
                  style: Theme.of(context).textTheme.bodyLarge,
                )
              else
                ...missions.activeMissions.map((m) => _MissionNodeCard(
                      mission: m,
                      refLat: _refLat,
                      refLng: _refLng,
                      onActivate: () => _activateMission(m),
                      onRoute: () => _calculateRoute(m),
                      onAlert: () => _triggerAlert(m, mind.state),
                    )),
              SizedBox(height: AccessibilityTheme.space4),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _activateMission(NodeMission mission) async {
    final tts = context.read<TtsAudioService>();
    final haptic = context.read<HapticFeedbackService>();
    final mind = context.read<OperatorMindManager>();

    await haptic.playMorse('A');
    await tts.speak(
      'Misión activada: ${mission.title}. Intensidad de brecha: ${mission.breachIntensity}.',
    );

    await mind.applyBreachExposure(mission.breachExposure);
  }

  Future<void> _calculateRoute(NodeMission mission) async {
    final tts = context.read<TtsAudioService>();
    final haptic = context.read<HapticFeedbackService>();

    final distance = mission.distanceFrom(_refLat, _refLng);
    final distanceKm = distance / 1000;

    await haptic.playMorse('R');
    await tts.speak(
      'Ruta calculada a ${mission.title}. Distancia: '
      '${distanceKm.toStringAsFixed(2)} kilómetros.',
    );
  }

  Future<void> _triggerAlert(
    NodeMission mission,
    OperatorMindState state,
  ) async {
    final tts = context.read<TtsAudioService>();
    final haptic = context.read<HapticFeedbackService>();
    final dispatcher = context.read<AlertDispatcherService>();

    await haptic.playMorse('SOS');
    await tts.speak(
      'Alerta local disparada. Nodo: ${mission.title}.',
      priority: TtsPriority.critical,
    );

    await dispatcher.dispatch(
      operatorCallsign: 'OPERADOR-1',
      nodeId: mission.id,
      latitude: mission.latitude,
      longitude: mission.longitude,
      mindState: state.stateMode == MindStateMode.imaginaryNumber
          ? 'IMAGINARY_NUMBER'
          : 'REAL_NUMBER',
    );
  }
}

// ─── Operator Status Banner ───────────────────────────────────────────

class _OperatorStatusBanner extends StatelessWidget {
  final OperatorMindState state;

  const _OperatorStatusBanner({required this.state});

  @override
  Widget build(BuildContext context) {
    final color = state.isCritical
        ? AccessibilityTheme.error
        : state.isDistorted
            ? AccessibilityTheme.warning
            : AccessibilityTheme.success;
    final modeLabel = state.isDistorted
        ? 'Números Imaginarios'
        : 'Números Reales';

    return Semantics(
      container: true,
      label:
          'Estado del operador. Estabilidad: ${state.stability.round()} por ciento. Modo: $modeLabel.',
      child: Container(
        padding: const EdgeInsets.all(AccessibilityTheme.space2),
        decoration: BoxDecoration(
          color: AccessibilityTheme.surface,
          borderRadius: BorderRadius.circular(AccessibilityTheme.borderRadius),
          border: Border.all(color: color, width: 2),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Estabilidad: ${state.stability.round()}%',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: color,
                      height: 1.3,
                    ),
                  ),
                  Text(
                    'Modo: $modeLabel',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Reference Coordinate Card ────────────────────────────────────────

class _ReferenceCoordinateCard extends StatelessWidget {
  final double lat;
  final double lng;
  final void Function(double lat, double lng) onUpdate;

  const _ReferenceCoordinateCard({
    required this.lat,
    required this.lng,
    required this.onUpdate,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      label: 'Coordenada de referencia. Latitud: $lat. Longitud: $lng.',
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(AccessibilityTheme.space2),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Punto de Referencia',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              SizedBox(height: AccessibilityTheme.space1),
              Text(
                'Lat: ${lat.toStringAsFixed(4)}  Lng: ${lng.toStringAsFixed(4)}',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              SizedBox(height: AccessibilityTheme.space2),
              AccessibleButton(
                label: 'Usar Buenos Aires',
                hint: 'Establece el punto de referencia en Buenos Aires.',
                onTap: () => onUpdate(-34.6037, -58.3816),
              ),
              SizedBox(height: AccessibilityTheme.space1),
              AccessibleButton(
                label: 'Usar Córdoba',
                hint: 'Establece el punto de referencia en Córdoba.',
                onTap: () => onUpdate(-31.4201, -64.1888),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Mission Node Card ────────────────────────────────────────────────

class _MissionNodeCard extends StatelessWidget {
  final NodeMission mission;
  final double refLat;
  final double refLng;
  final Future<void> Function() onActivate;
  final Future<void> Function() onRoute;
  final Future<void> Function() onAlert;

  const _MissionNodeCard({
    required this.mission,
    required this.refLat,
    required this.refLng,
    required this.onActivate,
    required this.onRoute,
    required this.onAlert,
  });

  @override
  Widget build(BuildContext context) {
    final distance = mission.distanceFrom(refLat, refLng);
    final distanceKm = distance / 1000;
    final intensityColor = mission.breachIntensity >= 7
        ? AccessibilityTheme.error
        : mission.breachIntensity >= 4
            ? AccessibilityTheme.warning
            : AccessibilityTheme.success;
    final hoursLeft = mission.expiresAt.difference(DateTime.now()).inHours;

    return Semantics(
      container: true,
      label:
          'Nodo: ${mission.title}. ${mission.description}. '
          'Intensidad de brecha: ${mission.breachIntensity} de 10. '
          'Distancia: ${distanceKm.toStringAsFixed(2)} kilómetros. '
          'Expira en $hoursLeft horas.',
      child: Container(
        margin: const EdgeInsets.only(bottom: AccessibilityTheme.space3),
        padding: const EdgeInsets.all(AccessibilityTheme.space3),
        decoration: BoxDecoration(
          color: AccessibilityTheme.surface,
          borderRadius: BorderRadius.circular(AccessibilityTheme.borderRadius),
          border: Border.all(color: intensityColor, width: 3),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              mission.title,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: AccessibilityTheme.textHigh,
                height: 1.3,
              ),
            ),
            SizedBox(height: AccessibilityTheme.space1),
            Text(
              mission.description,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            SizedBox(height: AccessibilityTheme.space2),
            _InfoRow(
              label: 'Intensidad',
              value: '${mission.breachIntensity}/10',
              color: intensityColor,
            ),
            SizedBox(height: AccessibilityTheme.space1),
            _InfoRow(
              label: 'Distancia',
              value: '${distanceKm.toStringAsFixed(2)} km',
              color: AccessibilityTheme.primary,
            ),
            SizedBox(height: AccessibilityTheme.space1),
            _InfoRow(
              label: 'Expira en',
              value: '$hoursLeft h',
              color: AccessibilityTheme.textHigh,
            ),
            SizedBox(height: AccessibilityTheme.space1),
            _InfoRow(
              label: 'Coordenadas',
              value:
                  '${mission.latitude.toStringAsFixed(4)}, ${mission.longitude.toStringAsFixed(4)}',
              color: AccessibilityTheme.textHigh,
            ),
            SizedBox(height: AccessibilityTheme.space3),
            AccessibleButton(
              label: 'Activar Misión',
              hint:
                  'Activa esta misión y aplica exposición de brecha al operador.',
              isPrimary: true,
              onTap: onActivate,
            ),
            SizedBox(height: AccessibilityTheme.space2),
            AccessibleButton(
              label: 'Calcular Ruta',
              hint:
                  'Calcula la distancia desde el punto de referencia hasta este nodo.',
              onTap: onRoute,
            ),
            SizedBox(height: AccessibilityTheme.space2),
            AccessibleButton(
              label: 'Disparar Alerta',
              hint:
                  'Envía una alerta local con coordenadas y estado mental al webhook.',
              onTap: onAlert,
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _InfoRow({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          '$label: ',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AccessibilityTheme.textHigh.withValues(alpha: 0.7),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ),
      ],
    );
  }
}
