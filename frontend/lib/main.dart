import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
import 'services/evolis_chain_verifier.dart';
import 'services/secure_storage_service.dart';
import 'services/tts_audio_service.dart';
import 'screens/main_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  ServiceLocator.init();
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  runApp(const SentraVisionApp());
}

class SentraVisionApp extends StatelessWidget {
  const SentraVisionApp({super.key});

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
      ],
      child: MaterialApp(
        title: 'Sentra Visión',
        debugShowCheckedModeBanner: false,
        theme: AccessibilityTheme.theme,
        home: const _TtsInit(child: MainScreen()),
      ),
    );
  }
}

/// Initializes [TtsAudioService.start()] once the provider tree is available.
class _TtsInit extends StatefulWidget {
  final Widget child;

  const _TtsInit({required this.child});

  @override
  State<_TtsInit> createState() => _TtsInitState();
}

class _TtsInitState extends State<_TtsInit> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TtsAudioService>().start();
      ServiceLocator.evolisVerifier.verifyOnStartup();
    });
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
