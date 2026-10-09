import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../config/accessibility_theme.dart';
import '../models/navigation_payloads.dart';
import '../services/accessibility_profile_manager.dart';
import '../widgets/accessible_button.dart';

/// Profile selection screen — lets the user switch between the three
/// accessibility profiles: Blind, Low Vision, and Deaf-Blind.
class ProfileSelectorScreen extends StatelessWidget {
  const ProfileSelectorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final profileMgr = context.watch<AccessibilityProfileManager>();
    final active = profileMgr.active;

    return Scaffold(
      backgroundColor: AccessibilityTheme.background,
      appBar: AppBar(title: const Text('Selector de Perfil')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AccessibilityTheme.space3),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(height: AccessibilityTheme.space2),
              Semantics(
                liveRegion: true,
                label: 'Perfil actual: ${_label(active.type)}',
                child: Text(
                  'Perfil actual: ${_label(active.type)}',
                  style: Theme.of(context).textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ),
              ),
              SizedBox(height: AccessibilityTheme.space3),
              Expanded(
                child: ListView(
                  children: [
                    _ProfileCard(
                      label: 'Ceguera Total',
                      description:
                          'Voz espacial 3D + vibraciones Morse. Sin dependencia visual.',
                      icon: Icons.visibility_off,
                      isSelected: active.type ==
                          AccessibilityProfileType.blind,
                      onTap: () => profileMgr.setProfile('blind'),
                    ),
                    SizedBox(height: AccessibilityTheme.space2),
                    _ProfileCard(
                      label: 'Baja Visión',
                      description:
                          'Alto contraste negro y amarillo, tipografía gigante, bordes táctiles.',
                      icon: Icons.visibility,
                      isSelected: active.type ==
                          AccessibilityProfileType.lowVision,
                      onTap: () => profileMgr.setProfile('low_vision'),
                    ),
                    SizedBox(height: AccessibilityTheme.space2),
                    _ProfileCard(
                      label: 'Sordociego',
                      description:
                          'Voz desactivada. Vibraciones rítmicas Morse intensas como canal principal.',
                      icon: Icons.hearing_disabled,
                      isSelected: active.type ==
                          AccessibilityProfileType.deafBlind,
                      onTap: () => profileMgr.setProfile('deaf_blind'),
                    ),
                  ],
                ),
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

  String _label(AccessibilityProfileType type) {
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

class _ProfileCard extends StatelessWidget {
  final String label;
  final String description;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _ProfileCard({
    required this.label,
    required this.description,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      hint: description,
      selected: isSelected,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AccessibilityTheme.borderRadius),
        child: Container(
          decoration: BoxDecoration(
            color: isSelected
                ? AccessibilityTheme.primary.withValues(alpha: 0.15)
                : AccessibilityTheme.surface,
            borderRadius:
                BorderRadius.circular(AccessibilityTheme.borderRadius),
            border: Border.all(
              color: AccessibilityTheme.primary,
              width: isSelected ? 3 : 2,
            ),
          ),
          padding: const EdgeInsets.all(AccessibilityTheme.space3),
          child: Row(
            children: [
              Icon(icon, color: AccessibilityTheme.primary, size: 40),
              const SizedBox(width: AccessibilityTheme.space2),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: const TextStyle(
                        color: AccessibilityTheme.textHigh,
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: AccessibilityTheme.space1 / 2),
                    Text(
                      description,
                      style: TextStyle(
                        color: AccessibilityTheme.textHigh.withValues(alpha: 0.7),
                        fontSize: 16,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              if (isSelected)
                const Icon(Icons.check_circle,
                    color: AccessibilityTheme.primary, size: 32),
            ],
          ),
        ),
      ),
    );
  }
}
