## Accesibilidad agnóstica (TalkBack / NVDA)

El objetivo es que la experiencia accesible funcione independientemente de servicios
específicos del sistema operativo como TalkBack (Android) o NVDA (Windows).

Estrategia aplicada:

- Implementar una capa de abstracción (`AccessibilityAdapter`) que use:
  - `flutter_tts` para síntesis local cuando esté disponible.
  - `vibration` para retroalimentación háptica cuando esté disponible.
  - Un fallback que envía un evento JSON (`voice.request` / `command`) al
    backend/transporte de eventos si la síntesis local no está presente o falla.
- Documentar cómo habilitar las dependencias y cómo pasar un `sendFallbackEvent`
  fiable (por ejemplo, un cliente WebSocket) desde la app hacia el adaptador.

Dependencias recomendadas (añadir en `pubspec.yaml`):

```yaml
dependencies:
  flutter_tts: ^4.0.0
  vibration: ^1.7.4
```

Ejemplo de uso (Flutter):

```dart
import 'package:your_app/services/accessibility_adapter.dart';

final a11y = AccessibilityAdapter(
  // Optional: provide a function that reliably sends events to your backend
  sendFallbackEvent: (event) async {
    // example: sentraClient.send(jsonEncode(event));
  },
);

await a11y.speak('Precaución: baja luminosidad detectada');
await a11y.vibratePattern([200, 100, 200]);
```

Notas:

- Esta aproximación permite que la app funcione con o sin servicios de accesibilidad
  nativos, y asegura una experiencia coherente en plataformas diversas.
- Para escenarios offline, el backend local de TTS (`server/vision/tts.py`) también
  puede usarse como respaldo si se dispone de conectividad LAN entre la app y el
  servicio de percepción.
