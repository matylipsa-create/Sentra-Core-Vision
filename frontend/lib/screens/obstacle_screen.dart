import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../config/accessibility_theme.dart';
import '../services/camera_duty_cycle_controller.dart';
import '../services/haptic_feedback_service.dart';
import '../widgets/accessible_button.dart';

/// Obstacle detection screen — starts/stops the camera duty cycle and
/// displays live FPS and proximity status with Semantics live regions.
class ObstacleScreen extends StatefulWidget {
  const ObstacleScreen({super.key});

  @override
  State<ObstacleScreen> createState() => _ObstacleScreenState();
}

class _ObstacleScreenState extends State<ObstacleScreen> {
  bool _active = false;
  String _statusText = 'Cámara inactiva';

  @override
  Widget build(BuildContext context) {
    final controller = context.read<CameraDutyCycleController>();

    return Scaffold(
      backgroundColor: AccessibilityTheme.background,
      appBar: AppBar(title: const Text('Detección de Obstáculos')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AccessibilityTheme.space3),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(height: AccessibilityTheme.space3),
              Semantics(
                liveRegion: true,
                label: _statusText,
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(AccessibilityTheme.space3),
                    child: Column(
                      children: [
                        Icon(
                          _active
                              ? Icons.radar
                              : Icons.radar_outlined,
                          color: AccessibilityTheme.primary,
                          size: 64,
                        ),
                        SizedBox(height: AccessibilityTheme.space2),
                        Text(
                          _statusText,
                          style: Theme.of(context).textTheme.headlineSmall,
                          textAlign: TextAlign.center,
                        ),
                        if (_active) ...[
                          SizedBox(height: AccessibilityTheme.space1),
                          Text(
                            'FPS: ${controller.currentFps.toStringAsFixed(1)}',
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
              SizedBox(height: AccessibilityTheme.space3),
              AccessibleButton(
                label: _active ? 'Detener Cámara' : 'Iniciar Cámara',
                hint: _active
                    ? 'Detiene la detección de obstáculos.'
                    : 'Inicia la cámara a 2-5 FPS. Vibra al detectar obstáculos a menos de 1.5 metros.',
                isPrimary: true,
                onTap: () {
                  final haptic = context.read<HapticFeedbackService>();
                  setState(() {
                    if (_active) {
                      controller.stop();
                      _active = false;
                      _statusText = 'Cámara inactiva';
                    } else {
                      controller.start((_) => double.infinity);
                      haptic.start();
                      _active = true;
                      _statusText = 'Cámara activa — procesando';
                    }
                  });
                },
              ),
              SizedBox(height: AccessibilityTheme.space2),
              AccessibleButton(
                label: 'Volver',
                hint: 'Regresa al menú principal.',
                onTap: () => Navigator.of(context).pop(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
