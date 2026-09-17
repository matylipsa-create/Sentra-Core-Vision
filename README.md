# Sentra Core v4.0.0_BIO

**Motor de IA Soberano, Offline-First, con Veto Humano y Trazabilidad Inalterable**

> Cuando todo lo demás se apaga, Sentra Core sigue ahí.

---

## Features Implementadas (2026-09-14)

### Sentra Core Vision (App para personas ciegas)

- ✅ UI minimalista: 1 botón 'ACTIVAR VISIÓN'
- ✅ Cámara + COCO-SSD: detección local offline (< 200ms)
- ✅ TTS configurable: velocidades 1x, 1.5x, 2x
- ✅ Traducción ES: 80 clases COCO-SSD (keyboard → teclado)
- ✅ Debounce: 3 segundos (evita repetición)
- ✅ Feedback háptico: por distancia (VERY_CLOSE, CLOSE, FAR)
- ✅ Audio 3D binaural: panning izquierda/derecha
- ✅ ARIA 100%: TalkBack, VoiceOver, NVDA ready
- ✅ Onboarding por voz: TTS al primer uso
- ✅ OCR: Tesseract.js v7.0.0 (español, offline)
- ✅ MoralNode: veto ético con 4 reglas
- ✅ EVOLIS: trazabilidad hash chain SHA-256

### Build

- Módulos: 1360
- Errores TypeScript: 0
- PWA: instalable, offline-first

---

## Roadmap

### Corto plazo (Q4 2026)

- 🟡 Flutter Android: APK nativo con TalkBack
- 🟡 Cola de sync IndexedDB: persistencia offline
- 🟡 Piloto UMADESCA: 10 usuarios reales
- 🟡 Video demo: 2-3 minutos para ATICMA

### Mediano plazo (Q1 2027)

- 🟡 Tótem 2.0: ESP32-S3 + LoRa mesh
- 🟡 OCR con Google ML Kit: mejor precisión
- 🟡 Audio 3D avanzado: HRTF real

### Largo plazo (2027)

- 🟡 9 modos de operación: Visión, Seguridad, Movimiento, etc.
- 🟡 Red nacional: UMADESCA + defensa civil
- 🟡 Marketplace: integraciones con 911, redes privadas

---

## Visión General

Sentra Core es un **motor de inteligencia artificial soberano** que funciona completamente offline, con un filtro ético inquebrantable (veto humano) y trazabilidad criptográfica inalterable (EVOLIS). Es una navaja suiza modular con 9 modos de operación, diseñada para funcionar en cualquier dispositivo — celular, PC o hardware dedicado — sin depender de la nube.

### Principios Fundamentales

1. **Offline-first**: Toda operación funciona sin conexión a internet
2. **Veto humano estricto**: El veto humano siempre tiene prioridad sobre cualquier acción
3. **Soberanía del dato**: Los datos pertenecen al usuario, almacenados localmente
4. **Trazabilidad inalterable**: EVOLIS + firmas ECDSA P-256
5. **Modularidad**: Navaja suiza con 9 modos de operación
6. **Multiplataforma**: Celular + PC + hardware dedicado, UI adaptativa
7. **Sincronización P2P**: Syncthing / Bluetooth Mesh / LoRa
8. **Bio-Software Interface**: Inferencia activa, placebos cognitivos, neuroplasticidad, epigenética, reencuadre cognitivo y coherencia cardíaca
9. **Accesibilidad nativa**: TalkBack, VoiceOver, NVDA, ARIA — sin soluciones parche

---

## Ecosistema

### Producto Paraguas: Sentra Core

Sentra Core es el motor central del que derivan todas las verticales y productos. Reúne 14 módulos de núcleo que pueden combinarse para crear soluciones específicas.

### Módulos del Motor

| Módulo | Responsabilidad |
|--------|----------------|
| **MoralNode** | Filtro ético con 4 reglas inquebrantables (no violencia, privacidad, offline, veto humano) |
| **EVOLIS** | Hash chain SHA-256 + firmas ECDSA P-256 para trazabilidad inalterable |
| **BioSoftwareInterface** | Inferencia activa, placebos cognitivos, reencuadre, coherencia cardíaca, neuroplasticidad, epigenética |
| **PerceptionEngine** | Visión (COCO-SSD), audio, IMU, STF, GPS — con anti-paraidolia y detección de camuflaje |
| **SyncManager** | Sincronización P2P (Syncthing / Bluetooth Mesh / LoRa) |
| **ModuleManager** | Navaja suiza — 9+ modos de operación |
| **TCREIBridge** | Puente percepción ↔ lenguaje (prompt + response) con normalización de acentos |
| **GeminiService** | IA generativa con fallback local + cache offline |
| **VoiceManager** | Síntesis de voz (TTS) + escucha pasiva (STT) con normalización de acentos |
| **StorageService** | IndexedDB + exportación / importación |
| **SensorService** | GPS, IMU, barómetro, luz, brújula |
| **HardwareAutoAdjust** | Auto-ajuste según hardware (incluye Bio) |
| **BacterialGuardian** | Defensa USB + cadena EVOLIS + lógica ternaria (+1, 0, -1) |
| **TernaryMath** | Aritmética ternaria para confianza y ética |

### 9 Modos de Operación

| Modo | Descripción |
|------|-------------|
| **Visión** | Cámara + COCO-SSD + descripción por voz — asistencia visual |
| **Seguridad** | Sensores + alertas + EVOLIS + monitoreo |
| **Movimiento** | GPS + IMU + orientación + vibración guía |
| **Juego** | Narrativa adaptativa |
| **Aprendizaje** | GeminiService + preguntas + respuestas |
| **Impacto** | STF + ARS Evolved + energy harvesting |
| **Silencio** | Vibración + LEDs (sin voz) |
| **Evidencia** | EVOLIS + hash chain + exportación |
| **Bio** | Inferencia activa, placebos cognitivos, neuroplasticidad, coherencia cardíaca |

---

## Verticales y Productos

### Sentra Visión (UMADESCA)

Asistencia visual para personas ciegas o con baja visión. Detección de objetos offline con COCO-SSD, descripción por voz bilateral y navegación contextual. Validado con usuarios reales de UMADESCA (Unión Marplatense de Discapacidad Visual).

### Sentinel

Modo de seguridad y monitoreo con sensores + EVOLIS + Guardian Bacteriano. Defensa USB activa, verificación de cadena de evidencia y alertas en tiempo real.

### EVOLIS (Independiente)

Sistema de trazabilidad inalterable como producto standalone. Hash chain con SHA-256 y firmas ECDSA P-256. Aplicable a cadena de suministro, auditoría, forense y compliance.

### ZION

Domótica soberana. Control de hogar sin nube, con sincronización P2P y veto humano.

### Can You Survive?

Juego de supervivencia narrativa impulsado por el motor Sentra Core. Narrativa adaptativa que se ajusta al estado del jugador.

### ARS Evolved

Sistema de energy harvesting y gestión de energía. Modo impacto con STF (Skin Temperature Flux) y optimización de consumo.

---

## Hardware: Tótem 2.0

El Tótem 2.0 es el hardware de referencia para despliegues de Sentra Core en entornos sin conectividad:

- **Nodo central**: Raspberry Pi 4 / PC de bajo consumo
- **Nodos de percepción**: ESP32 con sensores (temperatura, humedad, luz, movimiento, cámara, STF)
- **Comunicación**: LoRa (larga distancia), Bluetooth Mesh (local), Syncthing (P2P)
- **Energía**: Batería recargable, carga Qi, panel solar (opcional)
- **Almacenamiento**: Ranura USB/SD para exportación de evidencia y actualizaciones
- **Ver arquitectura detallada**: `docs/HARDWARE_TOTEM_2.0.md`

---

## Licenciamiento y Modelo de Negocio

| Modelo | Descripción |
|--------|-------------|
| **Open Core** | Núcleo open source, módulos premium propietarios |
| **SaaS** | Suscripción mensual para características avanzadas (Gemini remoto, sync P2P) |
| **B2B** | Licencias empresariales para integración (seguridad, auditoría, forense) |
| **B2G** | Contratos gubernamentales (accesibilidad, soberanía tecnológica, defensa) |
| **Hardware** | Venta del Tótem 2.0 y nodos ESP32 |

---

## Detección Offline

La detección de objetos (COCO-SSD) se ejecuta **siempre localmente**, sin depender de la conexión a internet. El modo offline solo afecta a la IA generativa (Gemini), no a la percepción.

- Cuando hay internet + Gemini ON: respuestas en lenguaje natural generadas por la IA
- Cuando no hay internet o Gemini OFF: respuestas contextuales basadas en los objetos detectados
- Cache de respuestas offline en memoria para respuesta instantánea (< 200ms)
- **Anti-paraidolia**: umbral de confianza (0.7) y filtrado de falsas detecciones
- **Detección de camuflaje**: análisis de solapamiento de bounding boxes y cobertura de escena
- **Ajuste bio-contextual**: la sensibilidad visual se ajusta según el estado del usuario (estrés, enfoque, coherencia)

## Voz Bilateral

Sentra Core soporta comunicación de voz en dos direcciones:

- **Síntesis de voz (TTS)**: El agente habla usando SpeechSynthesis con selector de voces del sistema
- **Escucha pasiva (STT)**: Cuando se activa "Escucha ON", el agente escucha continuamente usando SpeechRecognition y procesa comandos de voz automáticamente
- **Comando manual**: Botón de voz para comandos puntuales sin escucha pasiva
- **Normalización de acentos**: Los transcripciones de voz se normalizan con tildes correctas (como → cómo, que → qué)

El filtro ético (MoralNode) se aplica a **todos** los comandos, tanto de voz como de texto.

## Filtro Ético (MoralNode)

4 reglas inquebrantables:

1. **NO_VIOLENCE**: Bloquea comandos con lenguaje violento
2. **PRIVACY_FIRST**: Bloquea solicitudes de datos sensibles
3. **OFFLINE_ONLY**: Verifica operación offline (activa con externalRequest: true)
4. **HUMAN_VETO**: El veto humano bloquea todas las acciones

## Trazabilidad (EVOLIS)

- Hash chain con SHA-256
- Firmas digitales ECDSA P-256
- Roadmap: Dilithium post-cuántico en Q1 2027
- Verificación de integridad de la cadena completa
- Exportación de respaldo completo
- Almacenamiento persistente en IndexedDB
- Guardian Bacteriano: monitoreo continuo de integridad con lógica ternaria

## BioSoftware (BioSoftwareInterface)

Capa funcional que optimiza el "hardware biológico" del usuario:

- **Coherencia cardíaca**: Respiración guiada 5.5 bpm con guía visual (inhala/exhala)
- **Placebo cognitivo**: Refuerzo de expectativas positivas
- **Reencuadre cognitivo**: Cambio de perspectiva ante estrés o ansiedad
- **Inferencia activa**: Predicción y minimización de error
- **Neuroplasticidad**: Ejercicios de formación de conexiones neuronales
- **Epigenética**: Modulación de expresión génica mediante hábitos

Cada protocolo genera sesiones con métricas (coherencia, estrés, enfoque, ciclos respiratorios) y reencuadres contextuales. Las sesiones se registran en EVOLIS.

## Guardian Bacteriano

Defensa activa con lógica ternaria (+1, 0, -1):

- Monitoreo de puertos USB (WebUSB)
- Verificación continua de la cadena EVOLIS
- Estados: Dormido → Activo → Alerta → Cuarentena
- Sistema de confianza ternaria ponderada

## PWA

- Instalable en celular y desktop
- Service Worker con cache offline-first
- Manifest con iconos y colores de tema
- Funciona sin conexión a internet

## Accesibilidad

- **TalkBack** (Android): Soporte nativo via Flutter Semantics / ARIA
- **VoiceOver** (iOS): Soporte nativo via Flutter Semantics / ARIA
- **NVDA / JAWS** (Windows): Soporte via Flutter Desktop / ARIA
- **Contraste**: WCAG 2.1 AA (ratio >= 4.5:1)
- **Focus visible**: Outline neón de 3px en todos los elementos focalizables
- **Tamaños táctiles**: Mínimo 56px de altura en botones (64px en touch)
- **Feedback háptico**: navigator.vibrate en cada cambio de estado

## Arquitectura

```
src/
  lib/crypto.ts              SHA-256, UUID, hash chain, firmas ECDSA P-256
  core/
    MoralNode.ts             Filtro ético (4 reglas inquebrantables)
    EVOLIS.ts                Hash chain + trazabilidad inalterable
    TCREIBridge.ts           Puente percepción ↔ lenguaje (con acentos)
    GeminiService.ts         IA con fallback local + cache offline
    PerceptionEngine.ts      Visión, audio, IMU, STF, GPS + anti-paraidolia
    DeviceManager.ts         Detección de capacidades
    PowerManager.ts          Ultra ahorro / normal / alto rendimiento
    SyncManager.ts           Sincronización P2P (LoRa / BT Mesh / Syncthing)
    BioSoftwareInterface.ts  Inferencia activa, placebos, reencuadre, coherencia
    HardwareAutoAdjust.ts    Auto-ajuste según hardware (incluye Bio)
    BacterialGuardian.ts     Defensa USB + cadena EVOLIS + lógica ternaria
    TernaryMath.ts           Aritmética ternaria (+1, 0, -1)
  services/
    VoiceManager.ts          Síntesis + escucha pasiva + normalización de acentos
    StorageService.ts        IndexedDB + exportación/importación
    SensorService.ts         GPS, IMU, barómetro, luz, brújula
    USBService.ts            WebUSB, autenticación y bloqueo de dispositivos
  hooks/
    useRealModeSensors       COCO-SSD + MoralNode + EVOLIS + bio-contexto
    useDeviceCapabilities    Detección de dispositivo
    usePowerMode             Gestión de energía
    useBacterialGuardian     Estado del guardian
    useHardwareAutoAdjust   Auto-ajuste de hardware
    useSensorService         Sensores en tiempo real
  context/
    AppContext.tsx           Estado global + persistencia de settings
    ToastContext.tsx         Notificaciones
  components/
    AccessibleMinimalUI     Voz bilateral, vibración, ARIA, banner de respuesta
    AdaptiveUI               Táctil vs mouse/teclado
    CameraStream             Cámara en vivo + detecciones
    VoiceOrbButton           Orbe de voz bidireccional (ChatGPT/Gemini Live style)
    TactileModuleDrawer      Cajón táctil de módulos (bottom sheet)
    GuardianView              Vista del guardian bacteriano
    DemoModeBanner           Métricas del sistema
  modules/
    ModuleManager            Navaja suisa - activar/desactivar módulos
  App.tsx                   Componente principal
  main.tsx                   Punto de entrada
  registerServiceWorker      PWA offline
public/
  manifest.json              Configuración PWA
  sw.js                      Service Worker offline-first
  icon.svg                   Icono de la app
server/
  index.ts                   WebSocket + REST API server
  tcrei-protocol.ts         Protocolo TCREI (mensajes JSON estructurados)
frontend/                    Flutter (Dart) — iOS, Android, Web, Desktop
scripts/
  generate-state.js          Generador de estado EVOLIS + MoralNode
docs/
  PITCH_TUTELLUS.md           Pitch deck para Tutellus Investors Day
  PITCH_ATICMA.md             Pitch deck para ATICMA Emprende 2026
  EXECUTIVE_SUMMARY.md        Resumen ejecutivo (1 página)
  DEMO_VIDEO_SCRIPT.md        Guion de video demo (2-3 minutos)
  HARDWARE_TOTEM_2.0.md       Arquitectura de hardware Tótem 2.0
```

## Estado del Proyecto (2026-09-14)

- Build: ✅ Pasa (0 errores TypeScript)
- Archivos en src/core/: 31
- Archivos en src/components/: 21
- Archivos en src/services/: 10
- Archivos en src/modules/: 6
- Código muerto: 0
- Flutter frontend: completo
- Server backend: funcional

## Verificación

```bash
npm run typecheck   # Verificación de tipos
npm run build       # Build de producción
npm run preview     # Preview PWA
```

## Versiones

| Componente | Versión | Lenguaje |
|------------|---------|----------|
| Sentra Core Motor | 4.0.0_BIO | TypeScript |
| Sentra Core API Server | 1.0.0 | TypeScript (Node.js) |
| Sentra Core Frontend | 1.0.0 | Dart (Flutter) |
| Protocolo TCREI | 4.0 | JSON |

## Validación

- **UMADESCA**: Unión Marplatense de Discapacidad Visual — usuarios reales probando Sentra Visión
- **Naty**: Usuario piloto de asistencia visual
- Código funcional con build de producción verificado

---

## Contacto

Sentra Core — Soberanía tecnológica desde Mar del Plata, Argentina.

> Cuando todo lo demás se apaga, Sentra Core sigue ahí.
