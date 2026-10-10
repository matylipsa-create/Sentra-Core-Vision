import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../config/accessibility_theme.dart';
import '../interfaces/hardware_interfaces.dart';
import '../locator.dart';
import '../services/tts_audio_service.dart';
import '../widgets/accessible_button.dart';

/// Hardware connectivity diagnostics screen.
///
/// Verifies the TTS engine, camera availability, and haptic system on
/// startup, reporting results in plain text and via voice for blind users.
/// If any component requires permissions, it reports the action the user
/// must take.
class HardwareDiagnosticsScreen extends StatefulWidget {
  const HardwareDiagnosticsScreen({super.key});

  @override
  State<HardwareDiagnosticsScreen> createState() =>
      _HardwareDiagnosticsScreenState();
}

class _HardwareDiagnosticsScreenState extends State<HardwareDiagnosticsScreen> {
  String _ttsStatus = 'Verificando…';
  String _cameraStatus = 'Verificando…';
  String _hapticStatus = 'Verificando…';
  String _platformLabel = '';

  @override
  void initState() {
    super.initState();
    _platformLabel = ServiceLocator.platformLabel;
    WidgetsBinding.instance.addPostFrameCallback((_) => _runDiagnostics());
  }

  Future<void> _runDiagnostics() async {
    final tts = context.read<TtsAudioService>();
    final buffer = StringBuffer();

    // TTS
    String ttsResult;
    try {
      await tts.start();
      if (tts.isInitialized) {
        ttsResult = 'TTS nativo inicializado correctamente (es-AR).';
      } else {
        ttsResult =
            'TTS no disponible. Requerido para retroalimentación de voz.';
      }
    } catch (e) {
      ttsResult = 'Error de TTS: $e';
    }
    _ttsStatus = ttsResult;
    buffer.writeln(ttsResult);

    // Camera
    final camInfo = await ServiceLocator.camera.checkAvailability();
    switch (camInfo.status) {
      case CameraStatus.available:
        _cameraStatus = 'Cámara disponible y autorizada.';
        break;
      case CameraStatus.permissionDenied:
        _cameraStatus =
            'Permiso de cámara requerido. Otórgalo para usar detección de obstáculos.';
        break;
      case CameraStatus.unavailable:
        _cameraStatus =
            'Cámara no disponible. Funcionando en modo de simulación.';
        break;
    }
    buffer.writeln(_cameraStatus);

    // Haptics
    try {
      await ServiceLocator.haptic.lightImpact();
      _hapticStatus = ServiceLocator.isMobile
          ? 'Vibración nativa disponible.'
          : 'Vibración en modo simulación (escritorio).';
    } catch (e) {
      _hapticStatus = 'Vibración no disponible: $e';
    }
    buffer.writeln(_hapticStatus);

    setState(() {
      _platformLabel = ServiceLocator.platformLabel;
    });

    // Voice the full report for blind users
    final summary =
        'Plataforma $platformLabelStr. $ttsStatusStr $cameraStatusStr $hapticStatusStr';
    await tts.speak(summary);

    if (mounted) {
      setState(() {
        // keep the UI in sync with the latest diagnostic data
      });
    }
  }

  String get platformLabelStr => _platformLabel;
  String get ttsStatusStr => _ttsStatus;
  String get cameraStatusStr => _cameraStatus;
  String get hapticStatusStr => _hapticStatus;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AccessibilityTheme.background,
      appBar: AppBar(
        title: const Text('Diagnóstico de Hardware'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AccessibilityTheme.space3),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(AccessibilityTheme.space3),
                    child: Column(
                      children: [
                        Icon(Icons.info_outline,
                            size: 48, color: AccessibilityTheme.primary),
                        SizedBox(height: AccessibilityTheme.space2),
                        Text(
                          'Plataforma: $_platformLabel',
                          style: Theme.of(context).textTheme.titleLarge,
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
                SizedBox(height: AccessibilityTheme.space2),
                _DiagnosticCard(
                  icon: Icons.record_voice_over,
                  title: 'Motor TTS',
                  status: _ttsStatus,
                ),
                SizedBox(height: AccessibilityTheme.space2),
                _DiagnosticCard(
                  icon: Icons.camera_alt_outlined,
                  title: 'Cámara',
                  status: _cameraStatus,
                ),
                SizedBox(height: AccessibilityTheme.space2),
                _DiagnosticCard(
                  icon: Icons.vibration,
                  title: 'Vibración',
                  status: _hapticStatus,
                ),
                SizedBox(height: AccessibilityTheme.space3),
                if (_cameraStatus.contains('Permiso'))
                  AccessibleButton(
                    label: 'Solicitar Permiso de Cámara',
                    hint: 'Pide permiso para usar la cámara.',
                    isPrimary: true,
                    onTap: () async {
                      final granted =
                          await ServiceLocator.camera.requestPermission();
                      setState(() {
                        if (granted) {
                          _cameraStatus = 'Permiso concedido. Cámara disponible.';
                        } else {
                          _cameraStatus =
                              'Permiso denegado. Habilita la cámara en Configuración.';
                        }
                      });
                      context
                          .read<TtsAudioService>()
                          .speak(_cameraStatus);
                    },
                  ),
                SizedBox(height: AccessibilityTheme.space2),
                AccessibleButton(
                  label: 'Repetir Diagnóstico por Voz',
                  hint: 'Vuelve a verificar y anunciar el estado del hardware.',
                  onTap: () => _runDiagnostics(),
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
      ),
    );
  }
}

class _DiagnosticCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String status;

  const _DiagnosticCard({
    required this.icon,
    required this.title,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      liveRegion: true,
      label: '$title: $status',
      child: Card(
        child: ListTile(
          leading: Icon(icon, color: AccessibilityTheme.primary, size: 32),
          title: Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          subtitle: Text(
            status,
            style: const TextStyle(fontSize: 15),
          ),
        ),
      ),
    );
  }
}
