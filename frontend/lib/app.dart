import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'config/accessibility_theme.dart';
import 'locator.dart';
import 'services/accessibility_profile_manager.dart';
import 'services/camera_duty_cycle_controller.dart';
import 'services/error_handler.dart';
import 'services/event_bus.dart';
import 'services/haptic_feedback_service.dart';
import 'services/alert_dispatcher_service.dart';
import 'services/air_gap_export_service.dart';
import 'services/cognitive_load_manager.dart';
import 'services/evolis_chain_verifier.dart';
import 'services/secure_storage_service.dart';
import 'services/sensor_mitigation_engine.dart';
import 'services/tts_audio_service.dart';
import 'services/zero_allocation_frame_loop.dart';
import 'screens/main_screen.dart';

/// Widget raiz de Sentra Vision — arquitectura nativa accesible.
/// Call [ServiceLocator.init()] before building this widget.
class SentraApp extends StatelessWidget {
  const SentraApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<SentraEventBus>.value(value: EventBusProvider.instance),
        Provider<ErrorHandler>(
          create: (_) => ErrorHandler(),
          dispose: (_, h) => h.clearRecent(),
        ),
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
        ChangeNotifierProvider<TtsAudioService>(
          create: (_) => TtsAudioService(),
          dispose: (_, s) => s.dispose(),
        ),
        ChangeNotifierProvider<AlertDispatcherService>(
          create: (_) => AlertDispatcherService(),
          dispose: (_, s) => s.dispose(),
        ),
        ChangeNotifierProvider<SecureStorageService>.value(
          value: ServiceLocator.secureStorage,
        ),
        ChangeNotifierProvider<AirGapExportService>.value(
          value: ServiceLocator.airGapExport,
        ),
        ChangeNotifierProvider<EvolisChainVerifier>.value(
          value: ServiceLocator.evolisVerifier,
        ),
        ChangeNotifierProvider<CognitiveLoadManager>.value(
          value: ServiceLocator.cognitiveLoad,
        ),
        ChangeNotifierProvider<SensorMitigationEngine>.value(
          value: ServiceLocator.sensorMitigation,
        ),
        Provider<ZeroAllocationFrameLoop>.value(
          value: ServiceLocator.frameLoop,
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
