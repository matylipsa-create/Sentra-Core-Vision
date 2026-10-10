import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../config/accessibility_theme.dart';
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
/// Semantics for TalkBack / VoiceOver / NVDA. The layout uses a Column with
/// Expanded children so buttons fill available space equally on any screen
/// size — no scrolling required.
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
    final textScale = MediaQuery.textScalerOf(context).scale(1.0);
    final needsScroll = textScale > 1.8;

    return Scaffold(
      backgroundColor: AccessibilityTheme.background,
      body: SafeArea(
        child: Semantics(
          container: true,
          label: 'Menú principal de Sentra Visión. Cuatro opciones: Detección de Obstáculos, Lectura OCR, Selector de Perfil, y Configuración de Voz y Háptica.',
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AccessibilityTheme.space3,
              vertical: AccessibilityTheme.space2,
            ),
            child: needsScroll
                ? SingleChildScrollView(
                    child: _buildMenuContent(context, active, needsScroll),
                  )
                : _buildMenuContent(context, active, needsScroll),
          ),
        ),
      ),
    );
  }

  Widget _buildMenuContent(
    BuildContext context,
    dynamic active,
    bool useFixedHeight,
  ) {
    final children = <Widget>[
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
    ];

    final buttons = <Widget>[
      _GiantButton(
        label: 'Detección de Obstáculos',
        hint:
            'Activa la cámara y detecta obstáculos cercanos con vibraciones de alerta.',
        isPrimary: true,
        icon: Icons.radar,
        onTap: () => _navigateTo(context, const ObstacleScreen()),
      ),
      _GiantButton(
        label: 'Lectura OCR / Texto',
        hint: 'Apunta la cámara a texto para que sea leído en voz alta.',
        icon: Icons.document_scanner_outlined,
        onTap: () => _navigateTo(context, const OcrScreen()),
      ),
      _GiantButton(
        label: 'Selector de Perfil',
        hint: 'Cambia entre Ceguera Total, Baja Visión y Sordociego.',
        icon: Icons.accessibility_new,
        onTap: () => _navigateTo(context, const ProfileSelectorScreen()),
      ),
      _GiantButton(
        label: 'Configuración de Voz y Háptica',
        hint: 'Ajusta la velocidad de voz y la intensidad de vibración.',
        icon: Icons.settings,
        onTap: () => _navigateTo(context, const VoiceSettingsScreen()),
      ),
    ];

    if (useFixedHeight) {
      for (final btn in buttons) {
        children.add(Padding(
          padding: const EdgeInsets.only(bottom: AccessibilityTheme.space2),
          child: btn,
        ));
      }
    } else {
      for (final btn in buttons) {
        children.add(SizedBox(height: AccessibilityTheme.space2));
        children.add(Expanded(child: btn));
      }
      children.add(SizedBox(height: AccessibilityTheme.space2));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: children,
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

/// A giant accessible button that fills its Expanded parent, with full
/// Semantics annotation and high-contrast styling.
class _GiantButton extends StatelessWidget {
  final String label;
  final String hint;
  final bool isPrimary;
  final IconData icon;
  final VoidCallback onTap;

  const _GiantButton({
    required this.label,
    required this.hint,
    required this.icon,
    this.isPrimary = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      hint: hint,
      enabled: true,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AccessibilityTheme.borderRadius),
        child: Container(
          width: double.infinity,
          decoration: BoxDecoration(
            color: isPrimary
                ? AccessibilityTheme.primary
                : AccessibilityTheme.surface,
            borderRadius: BorderRadius.circular(AccessibilityTheme.borderRadius),
            border: Border.all(
              color: AccessibilityTheme.primary,
              width: isPrimary ? 3 : 2,
            ),
          ),
          alignment: Alignment.center,
          padding: const EdgeInsets.symmetric(
            horizontal: AccessibilityTheme.space3,
            vertical: AccessibilityTheme.space2,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 48,
                color: isPrimary
                    ? AccessibilityTheme.onPrimary
                    : AccessibilityTheme.primary,
              ),
              SizedBox(height: AccessibilityTheme.space1),
              Text(
                label,
                textAlign: TextAlign.center,
                maxLines: 2,
                excludeSemantics: true,
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: isPrimary
                      ? AccessibilityTheme.onPrimary
                      : AccessibilityTheme.textHigh,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
