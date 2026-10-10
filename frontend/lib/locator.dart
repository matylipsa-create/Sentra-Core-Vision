import 'dart:io' show Platform;

import 'package:flutter/foundation.dart' show kIsWeb;

import 'interfaces/hardware_interfaces.dart';
import 'interfaces/android_camera_adapter.dart';
import 'interfaces/desktop_camera_adapter.dart';
import 'interfaces/desktop_haptic_adapter.dart';
import 'interfaces/desktop_tts_adapter.dart';
import 'interfaces/flutter_tts_adapter.dart';
import 'interfaces/platform_haptic_adapter.dart';
import 'services/secure_storage_service.dart';
import 'services/air_gap_export_service.dart';
import 'services/evolis_chain_verifier.dart';

/// Platform-conditional service registry.
///
/// On Android / iOS: registers native-backed adapters (FlutterTts, native
/// haptics, permission-checked camera).
/// On Desktop / Web: registers stub adapters so the app compiles and runs
/// in simulation mode without native bindings.
///
/// Call [ServiceLocator.init()] once at startup, then access the singletons
/// via [ServiceLocator.tts], [ServiceLocator.haptic], [ServiceLocator.camera].
class ServiceLocator {
  static late final ITtsService tts;
  static late final IHapticService haptic;
  static late final ICameraService camera;
  static late final bool isMobile;
  static late final SecureStorageService secureStorage;
  static late final AirGapExportService airGapExport;
  static late final EvolisChainVerifier evolisVerifier;

  ServiceLocator._();

  static void init() {
    final isAndroid = !kIsWeb && Platform.isAndroid;
    final isIOS = !kIsWeb && Platform.isIOS;
    isMobile = isAndroid || isIOS;

    if (isMobile) {
      tts = FlutterTtsAdapter();
      haptic = PlatformHapticAdapter();
      camera = AndroidCameraAdapter();
    } else {
      tts = DesktopTtsAdapter();
      haptic = DesktopHapticAdapter();
      camera = DesktopCameraAdapter();
    }

    secureStorage = SecureStorageService();
    airGapExport = AirGapExportService(storage: secureStorage);
    evolisVerifier = EvolisChainVerifier(storage: secureStorage);
  }

  /// Human-readable platform name for diagnostics UI.
  static String get platformLabel {
    if (kIsWeb) return 'Web (simulación)';
    if (Platform.isAndroid) return 'Android nativo';
    if (Platform.isIOS) return 'iOS nativo';
    if (Platform.isWindows) return 'Windows (simulación)';
    if (Platform.isMacOS) return 'macOS (simulación)';
    if (Platform.isLinux) return 'Linux (simulación)';
    return 'Desconocido';
  }
}
