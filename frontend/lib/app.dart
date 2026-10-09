import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'config/accessibility_theme.dart';
import 'services/accessibility_profile_manager.dart';
import 'services/camera_duty_cycle_controller.dart';
import 'services/event_bus.dart';
import 'services/haptic_feedback_service.dart';
import 'screens/main_screen.dart';

/// Widget raiz de Sentra Vision — arquitectura nativa accesible.
class SentraApp extends StatelessWidget {
  const SentraApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<SentraEventBus>.value(value: EventBusProvider.instance),
        ChangeNotifierProvider<AccessibilityProfileManager>(
          create: (_) => AccessibilityProfileManager(),
        ),
        Provider<CameraDutyCycleController>(
          create: (_) => CameraDutyCycleController(),
          dispose: (_, c) => c.dispose(),
        ),
        Provider<HapticFeedbackService>(
          create: (_) => HapticFeedbackService(),
          dispose: (_, s) => s.dispose(),
        ),
      ],
      child: MaterialApp(
        title: 'Sentra Visión',
        debugShowCheckedModeBanner: false,
        theme: AccessibilityTheme.theme,
        home: const MainScreen(),
      ),
    );
  }
}
