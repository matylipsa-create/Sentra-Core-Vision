import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../config/accessibility_theme.dart';
import '../models/navigation_payloads.dart';
import '../services/accessibility_profile_manager.dart';
import '../services/haptic_feedback_service.dart';
import '../widgets/accessible_button.dart';

/// Voice and haptic settings screen.
///
/// Lets the user adjust TTS rate and baseline haptic intensity on the
/// active accessibility profile. Changes apply immediately via the
/// [AccessibilityProfileManager].
class VoiceSettingsScreen extends StatefulWidget {
  const VoiceSettingsScreen({super.key});

  @override
  State<VoiceSettingsScreen> createState() => _VoiceSettingsScreenState();
}

class _VoiceSettingsScreenState extends State<VoiceSettingsScreen> {
  @override
  Widget build(BuildContext context) {
    final profileMgr = context.watch<AccessibilityProfileManager>();
    final active = profileMgr.active;

    return Scaffold(
      backgroundColor: AccessibilityTheme.background,
      appBar: AppBar(title: const Text('Voz y Háptica')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AccessibilityTheme.space3),
          child: ListView(
            children: [
              SizedBox(height: AccessibilityTheme.space2),

              // ---- TTS Rate ----
              Semantics(
                label:
                    'Velocidad de voz: ${active.ttsRate.toStringAsFixed(1)} veces',
                child: Text(
                  active.ttsEnabled
                      ? 'Velocidad de Voz: ${active.ttsRate.toStringAsFixed(1)}x'
                      : 'Voz desactivada (perfil Sordociego)',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),
              if (active.ttsEnabled) ...[
                SizedBox(height: AccessibilityTheme.space1),
                Slider(
                  value: active.ttsRate,
                  min: 0.5,
                  max: 3.0,
                  divisions: 25,
                  activeColor: AccessibilityTheme.primary,
                  thumbColor: AccessibilityTheme.primary,
                  onChanged: (v) => profileMgr.updateActive(
                    (p) => p.copyWith(ttsRate: v),
                  ),
                ),
              ],

              SizedBox(height: AccessibilityTheme.space3),

              // ---- Haptic Intensity ----
              Semantics(
                label:
                    'Intensidad de vibración: ${_hapticLabel(active.baselineHaptic)}',
                child: Text(
                  'Intensidad de Vibración: ${_hapticLabel(active.baselineHaptic)}',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),
              SizedBox(height: AccessibilityTheme.space1),
              _HapticSelector(
                current: active.baselineHaptic,
                onChanged: (intensity) => profileMgr.updateActive(
                  (p) => p.copyWith(baselineHaptic: intensity),
                ),
              ),

              SizedBox(height: AccessibilityTheme.space3),

              // ---- Test Haptic ----
              AccessibleButton(
                label: 'Probar Vibración',
                hint: 'Ejecuta un patrón de vibración de prueba.',
                onTap: () {
                  final haptic = context.read<HapticFeedbackService>();
                  haptic.playPattern(HapticPayload(
                    intensity: active.baselineHaptic,
                    pattern: const [300, 100, 300],
                    reason: 'test',
                  ));
                },
              ),
              SizedBox(height: AccessibilityTheme.space2),

              // ---- Morse Test (deaf-blind) ----
              if (active.morseMode) ...[
                AccessibleButton(
                  label: 'Probar Morse: Hola',
                  hint:
                      'Vibra la palabra Hola en código Morse para verificar el patrón táctil.',
                  onTap: () {
                    final haptic = context.read<HapticFeedbackService>();
                    haptic.playMorse('Hola');
                  },
                ),
                SizedBox(height: AccessibilityTheme.space2),
              ],

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

  String _hapticLabel(HapticIntensity intensity) {
    switch (intensity) {
      case HapticIntensity.light:
        return 'Ligera';
      case HapticIntensity.medium:
        return 'Media';
      case HapticIntensity.strong:
        return 'Fuerte';
      case HapticIntensity.critical:
        return 'Crítica';
    }
  }
}

class _HapticSelector extends StatelessWidget {
  final HapticIntensity current;
  final ValueChanged<HapticIntensity> onChanged;

  const _HapticSelector({
    required this.current,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    const levels = HapticIntensity.values;
    return Wrap(
      spacing: AccessibilityTheme.space2,
      runSpacing: AccessibilityTheme.space1,
      children: levels.map((level) {
        final isSelected = level == current;
        return Semantics(
          button: true,
          label: _labelFor(level),
          selected: isSelected,
          child: InkWell(
            onTap: () => onChanged(level),
            borderRadius:
                BorderRadius.circular(AccessibilityTheme.borderRadius),
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AccessibilityTheme.space3,
                vertical: AccessibilityTheme.space2,
              ),
              decoration: BoxDecoration(
                color: isSelected
                    ? AccessibilityTheme.primary
                    : AccessibilityTheme.surface,
                borderRadius: BorderRadius.circular(
                    AccessibilityTheme.borderRadius),
                border: Border.all(
                  color: AccessibilityTheme.primary,
                  width: 2,
                ),
              ),
              child: Text(
                _labelFor(level),
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: isSelected
                      ? AccessibilityTheme.onPrimary
                      : AccessibilityTheme.textHigh,
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  String _labelFor(HapticIntensity level) {
    switch (level) {
      case HapticIntensity.light:
        return 'Ligera';
      case HapticIntensity.medium:
        return 'Media';
      case HapticIntensity.strong:
        return 'Fuerte';
      case HapticIntensity.critical:
        return 'Crítica';
    }
  }
}
