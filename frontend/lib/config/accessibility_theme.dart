import 'package:flutter/material.dart';

/// High-contrast accessibility theme for Sentra Vision.
///
/// Palette: absolute black (#000000) background, high-vis yellow (#FFEB3B)
/// accents, white text on black, black text on yellow. Designed for
/// TalkBack / VoiceOver / NVDA compatibility with giant scalable typography.
class AccessibilityTheme {
  AccessibilityTheme._();

  static const Color background = Color(0xFF000000);
  static const Color surface = Color(0xFF121212);
  static const Color surfaceElevated = Color(0xFF1E1E1E);
  static const Color primary = Color(0xFFFFEB3B);
  static const Color primaryDark = Color(0xFFFDD835);
  static const Color onPrimary = Color(0xFF000000);
  static const Color textHigh = Color(0xFFFFFFFF);
  static const Color textOnYellow = Color(0xFF000000);
  static const Color border = Color(0xFFFFEB3B);
  static const Color warning = Color(0xFFFFC107);
  static const Color error = Color(0xFFFF5252);
  static const Color success = Color(0xFF69F0AE);

  static const double space1 = 8;
  static const double space2 = 16;
  static const double space3 = 24;
  static const double space4 = 32;
  static const double space5 = 40;
  static const double space6 = 48;

  static const double minTouchTarget = 56;
  static const double buttonHeight = 72;
  static const double borderRadius = 16;

  static ThemeData get theme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: background,
        colorScheme: const ColorScheme.dark(
          primary: primary,
          onPrimary: onPrimary,
          secondary: primary,
          onSecondary: onPrimary,
          surface: surface,
          onSurface: textHigh,
          error: error,
          onError: textHigh,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: background,
          surfaceTintColor: Colors.transparent,
          foregroundColor: primary,
          elevation: 0,
          centerTitle: true,
          titleTextStyle: TextStyle(
            color: primary,
            fontSize: 24,
            fontWeight: FontWeight.w700,
          ),
        ),
        textTheme: const TextTheme(
          displayLarge: TextStyle(
            color: textHigh,
            fontSize: 48,
            fontWeight: FontWeight.w800,
            height: 1.2,
          ),
          displayMedium: TextStyle(
            color: textHigh,
            fontSize: 36,
            fontWeight: FontWeight.w700,
            height: 1.2,
          ),
          headlineSmall: TextStyle(
            color: primary,
            fontSize: 28,
            fontWeight: FontWeight.w700,
            height: 1.2,
          ),
          titleLarge: TextStyle(
            color: textHigh,
            fontSize: 22,
            fontWeight: FontWeight.w600,
            height: 1.3,
          ),
          bodyLarge: TextStyle(
            color: textHigh,
            fontSize: 20,
            height: 1.5,
          ),
          bodyMedium: TextStyle(
            color: textHigh,
            fontSize: 18,
            height: 1.5,
          ),
          labelLarge: TextStyle(
            color: onPrimary,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: primary,
            foregroundColor: onPrimary,
            minimumSize: const Size(double.infinity, buttonHeight),
            padding: const EdgeInsets.symmetric(
                horizontal: space4, vertical: space3),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(borderRadius),
            ),
            textStyle: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: primary,
            minimumSize: const Size(double.infinity, buttonHeight),
            side: const BorderSide(color: primary, width: 3),
            padding: const EdgeInsets.symmetric(
                horizontal: space4, vertical: space3),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(borderRadius),
            ),
            textStyle: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        cardTheme: CardThemeData(
          color: surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(borderRadius),
            side: const BorderSide(color: primary, width: 2),
          ),
          margin: EdgeInsets.zero,
        ),
        dividerTheme: const DividerThemeData(
          color: primary,
          thickness: 2,
          space: 1,
        ),
        focusColor: primary.withValues(alpha: 0.25),
        visualDensity: VisualDensity.adaptivePlatformDensity,
      );
}
