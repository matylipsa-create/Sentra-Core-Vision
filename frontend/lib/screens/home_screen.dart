import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../config/accessibility_theme.dart';
import '../models/navigation_payloads.dart';
import '../services/accessibility_profile_manager.dart';
import '../services/camera_duty_cycle_controller.dart';
import '../services/event_bus.dart';
import '../widgets/accessible_button.dart';

/// Main accessible home screen.
///
/// Shows three large profile-selection buttons (Blind, Low Vision, Deaf-Blind)
/// and a start/stop toggle for the camera duty cycle. All interactive
/// elements use Semantics for TalkBack / VoiceOver / NVDA.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _cameraActive = false;

  @override
  Widget build(BuildContext context) {
    final profileMgr = context.watch<AccessibilityProfileManager>();
    final active = profileMgr.active;

    return Scaffold(
      backgroundColor: AccessibilityTheme.background,
      body: SafeArea(
        child: Semantics(
          container: true,
          label: 'Pantalla principal de Sentra Visión',
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AccessibilityTheme.space3,
              vertical: AccessibilityTheme.space2,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(height: AccessibilityTheme.space2),
                Text(
                  'Sentra Visión',
                  style: Theme.of(context).textTheme.displayMedium?.copyWith(
                        color: AccessibilityTheme.primary,
                      ),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: AccessibilityTheme.space1),
                Semantics(
                  liveRegion: true,
                  label:
                      'Perfil activo: ${_profileLabel(active.type)}. Toque un botón para cambiar.',
                  child: Text(
                    'Perfil: ${_profileLabel(active.type)}',
                    style: Theme.of(context).textTheme.titleLarge,
                    textAlign: TextAlign.center,
                  ),
                ),
                SizedBox(height: AccessibilityTheme.space3),
                Expanded(
                  child: ListView(
                    children: [
                      AccessibleButton(
                        label: 'Modo Ceguera Total',
                        hint:
                            'Activa voz espacial y vibraciones Morse para personas ciegas.',
                        isSelected: active.type ==
                            AccessibilityProfileType.blind,
                        onTap: () => profileMgr.setProfile('blind'),
                      ),
                      SizedBox(height: AccessibilityTheme.space2),
                      AccessibleButton(
                        label: 'Modo Baja Visión',
                        hint:
                            'Alto contraste negro y amarillo con tipografía gigante.',
                        isSelected: active.type ==
                            AccessibilityProfileType.lowVision,
                        onTap: () => profileMgr.setProfile('low_vision'),
                      ),
                      SizedBox(height: AccessibilityTheme.space2),
                      AccessibleButton(
                        label: 'Modo Sordociego',
                        hint:
                            'Voz desactivada, vibraciones rítmicas Morse intensas.',
                        isSelected: active.type ==
                            AccessibilityProfileType.deafBlind,
                        onTap: () => profileMgr.setProfile('deaf_blind'),
                      ),
                      SizedBox(height: AccessibilityTheme.space4),
                      AccessibleButton(
                        label: _cameraActive
                            ? 'Detener Cámara'
                            : 'Iniciar Cámara',
                        hint: _cameraActive
                            ? 'Detiene el procesamiento de cámara y detección de obstáculos.'
                            : 'Inicia la cámara a 2-5 FPS con detección de obstáculos.',
                        isPrimary: true,
                        onTap: _toggleCamera,
                      ),
                      SizedBox(height: AccessibilityTheme.space3),
                      _CameraStatusCard(active: _cameraActive),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _toggleCamera() {
    final controller =
        context.read<CameraDutyCycleController>();
    setState(() {
      if (_cameraActive) {
        controller.stop();
        _cameraActive = false;
      } else {
        controller.start((_) => double.infinity);
        _cameraActive = true;
      }
    });
  }

  String _profileLabel(AccessibilityProfileType type) {
    switch (type) {
      case AccessibilityProfileType.blind:
        return 'Ceguera Total';
      case AccessibilityProfileType.lowVision:
        return 'Baja Visión';
      case AccessibilityProfileType.deafBlind:
        return 'Sordociego';
    }
  }
}

class _CameraStatusCard extends StatelessWidget {
  final bool active;
  const _CameraStatusCard({required this.active});

  @override
  Widget build(BuildContext context) {
    final controller = context.read<CameraDutyCycleController>();
    return Semantics(
      liveRegion: true,
      label: active
          ? 'Cámara activa a ${controller.currentFps.toStringAsFixed(1)} FPS'
          : 'Cámara inactiva',
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(AccessibilityTheme.space2),
          child: Row(
            children: [
              Icon(
                active ? Icons.camera_alt : Icons.camera_alt_outlined,
                color: AccessibilityTheme.primary,
                size: 32,
              ),
              const SizedBox(width: AccessibilityTheme.space2),
              Expanded(
                child: Text(
                  active
                      ? 'Cámara: ${controller.currentFps.toStringAsFixed(1)} FPS'
                      : 'Cámara inactiva',
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
