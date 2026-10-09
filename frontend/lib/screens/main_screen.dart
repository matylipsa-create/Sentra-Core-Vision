import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../config/accessibility_theme.dart';
import '../models/navigation_payloads.dart';
import '../services/accessibility_profile_manager.dart';
import '../services/haptic_feedback_service.dart';
import '../widgets/accessible_button.dart';
import 'obstacle_screen.dart';
import 'ocr_screen.dart';
import 'profile_selector_screen.dart';
import 'voice_settings_screen.dart';

/// Main navigation hub with four giant accessible buttons.
///
/// Each button opens a dedicated sub-screen and is fully annotated with
/// Semantics for TalkBack / VoiceOver / NVDA.
class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  @override
  void initState() {
    super.initState();
    final haptic = context.read<HapticFeedbackService>();
    haptic.start();
  }

  @override
  Widget build(BuildContext context) {
    final profileMgr = context.watch<AccessibilityProfileManager>();
    final active = profileMgr.active;

    return Scaffold(
      backgroundColor: AccessibilityTheme.background,
      body: SafeArea(
        child: Semantics(
          container: true,
          label: 'Menú principal de Sentra Visión',
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
                      'Perfil activo: ${_profileLabel(active.type)}. Deslice hacia abajo para ver las cuatro opciones.',
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
                        label: 'Detección de Obstáculos',
                        hint:
                            'Activa la cámara y detecta obstáculos cercanos con vibraciones de alerta.',
                        isPrimary: true,
                        onTap: () => _navigateTo(context,
                            const ObstacleScreen()),
                      ),
                      SizedBox(height: AccessibilityTheme.space2),
                      AccessibleButton(
                        label: 'Lectura OCR / Texto',
                        hint:
                            'Apunta la cámara a texto para que sea leído en voz alta.',
                        onTap: () => _navigateTo(context,
                            const OcrScreen()),
                      ),
                      SizedBox(height: AccessibilityTheme.space2),
                      AccessibleButton(
                        label: 'Selector de Perfil',
                        hint:
                            'Cambia entre Ceguera Total, Baja Visión y Sordociego.',
                        onTap: () => _navigateTo(context,
                            const ProfileSelectorScreen()),
                      ),
                      SizedBox(height: AccessibilityTheme.space2),
                      AccessibleButton(
                        label: 'Configuración de Voz y Háptica',
                        hint:
                            'Ajusta la velocidad de voz y la intensidad de vibración.',
                        onTap: () => _navigateTo(context,
                            const VoiceSettingsScreen()),
                      ),
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

  void _navigateTo(BuildContext context, Widget screen) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => screen),
    );
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
