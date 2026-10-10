import 'package:flutter/material.dart';

import '../config/accessibility_theme.dart';

/// A large, high-contrast, fully semantic button for accessibility.
///
/// Meets the 72 dp minimum height requirement, has non-overlapping touch
/// areas, and exposes a full [Semantics] label + hint for TalkBack / NVDA.
class AccessibleButton extends StatelessWidget {
  final String label;
  final String? hint;
  final bool isPrimary;
  final bool isSelected;
  final VoidCallback onTap;

  const AccessibleButton({
    super.key,
    required this.label,
    this.hint,
    this.isPrimary = false,
    this.isSelected = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      hint: hint,
      selected: isSelected,
      enabled: true,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AccessibilityTheme.borderRadius),
        child: Container(
          width: double.infinity,
          constraints: const BoxConstraints(
            minHeight: AccessibilityTheme.buttonHeight,
          ),
          decoration: BoxDecoration(
            color: isPrimary
                ? AccessibilityTheme.primary
                : (isSelected
                    ? AccessibilityTheme.primary.withValues(alpha: 0.15)
                    : AccessibilityTheme.surface),
            borderRadius: BorderRadius.circular(AccessibilityTheme.borderRadius),
            border: Border.all(
              color: AccessibilityTheme.primary,
              width: isSelected || isPrimary ? 3 : 2,
            ),
          ),
          alignment: Alignment.center,
          padding: const EdgeInsets.symmetric(
            horizontal: AccessibilityTheme.space3,
            vertical: AccessibilityTheme.space2,
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
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
        ),
      ),
    );
  }
}
