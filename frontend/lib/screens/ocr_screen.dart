import 'package:flutter/material.dart' hide NavigationMode;
import 'package:provider/provider.dart';

import '../config/accessibility_theme.dart';
import '../models/navigation_payloads.dart' show NavigationMode;
import '../services/event_bus.dart';
import '../widgets/accessible_button.dart';

/// OCR / text reading screen.
///
/// In production this will invoke the camera + OCR pipeline. Currently
/// it emits a `navigation` event with mode `text_ocr` on the bus and
/// shows a TTS-ready status card.
class OcrScreen extends StatefulWidget {
  const OcrScreen({super.key});

  @override
  State<OcrScreen> createState() => _OcrScreenState();
}

class _OcrScreenState extends State<OcrScreen> {
  String _lastText = 'Sin texto detectado';
  bool _scanning = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AccessibilityTheme.background,
      appBar: AppBar(title: const Text('Lectura OCR / Texto')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AccessibilityTheme.space3),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(height: AccessibilityTheme.space3),
              Semantics(
                liveRegion: true,
                label: _scanning ? 'Escaneando texto' : _lastText,
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(AccessibilityTheme.space3),
                    child: Column(
                      children: [
                        Icon(
                          Icons.document_scanner_outlined,
                          color: AccessibilityTheme.primary,
                          size: 64,
                        ),
                        SizedBox(height: AccessibilityTheme.space2),
                        Text(
                          _scanning ? 'Escaneando...' : _lastText,
                          style: Theme.of(context).textTheme.headlineSmall,
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              SizedBox(height: AccessibilityTheme.space3),
              AccessibleButton(
                label: _scanning ? 'Detener' : 'Escanear Texto',
                hint: _scanning
                    ? 'Detiene el escaneo.'
                    : 'Apunta la cámara al texto y toca para leerlo en voz alta.',
                isPrimary: true,
                onTap: _toggleScan,
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

  void _toggleScan() {
    final bus = context.read<SentraEventBus>();
    setState(() {
      if (_scanning) {
        _scanning = false;
        _lastText = 'Escaneo detenido';
      } else {
        _scanning = true;
        _lastText = 'Escaneando...';
        bus.emit(
          SentraEventType.navigation,
          const NavigationEventPayload(
            mode: NavigationMode.textOcr,
            targetId: 0,
            accessibilityModeActive: true,
            parameters: {'source': 'camera'},
          ).toJson(),
        );
      }
    });
  }
}
