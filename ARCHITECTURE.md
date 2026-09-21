# Sentra Core v4.0.0_BIO — Arquitectura Definitiva

> Cuando todo lo demas se apaga, Sentra Core sigue ahi.

## Vision General

Sentra Core v4.0.0_BIO adopta una arquitectura de dos capas:

```
┌─────────────────────────────────────────────────┐
│              Frontend (Flutter / Dart)            │
│   iOS · Android · Web · Desktop (Win/Mac/Linux)   │
│   VoiceOrbButton · ModuleDrawer · BioView ·       │
│   EVOLISView · SettingsView · AccessibleHeader    │
│   Accesibilidad: TalkBack · VoiceOver · NVDA ·    │
│   Semantics · ARIA                                │
└──────────────────┬──────────────────────────────┘
                   │ WebSocket (tiempo real)
                   │ REST API (estado / consultas)
                   │ TCREI (JSON estructurado)
┌──────────────────┴──────────────────────────────┐
│           Backend (TypeScript / Node.js)          │
│   PerceptionEngine · MoralNode · EVOLIS ·         │
│   BioSoftwareInterface · SyncManager ·            │
│   ModuleManager · TCREIBridge · GeminiService ·   │
│   VoiceManager · StorageService · SensorService · │
│   HardwareAutoAdjust · BacterialGuardian ·        │
│   TernaryMath                                     │
└─────────────────────────────────────────────────┘
```

## 1. Backend — Motor TypeScript

**Lenguaje:** TypeScript  
**Runtime:** Node.js (Deno / Bun compatibles)  
**Codigo:** Reutiliza el motor existente en `src/core/`, `src/lib/`, `src/services/`

### Modulos del motor

| Modulo | Responsabilidad |
|--------|----------------|
| PerceptionEngine | Vision, audio, IMU, STF, GPS — procesamiento de percepcion |
| MoralNode | Filtro etico (4 reglas inquebrantables) |
| EVOLIS | Hash chain SHA-256 + firmas ECDSA P-256 |
| BioSoftwareInterface | Inferencia activa, placebos, reencuadre, coherencia cardiaca |
| SyncManager | Sincronizacion P2P (Syncthing / Bluetooth Mesh / LoRa) |
| ModuleManager | Navaja suiza — 9+ modos de operacion |
| TCREIBridge | Puente percepcion ↔ lenguaje (prompt + response) |
| GeminiService | IA generativa con fallback local + cache offline |
| VoiceManager | Sintesis de voz (TTS) + escucha pasiva (STT) |
| StorageService | IndexedDB + exportacion / importacion |
| SensorService | GPS, IMU, barometro, luz, brujula |
| HardwareAutoAdjust | Auto-ajuste segun hardware (incluye Bio) |
| BacterialGuardian | Defensa USB + cadena EVOLIS + logica ternaria |
| TernaryMath | Aritmetica ternaria (+1, 0, -1) para confianza |

### Servidor API

El servidor (`server/`) expone:

- **WebSocket** (`ws://localhost:8080/ws`): Comunicacion bidireccional en tiempo real para voz, sensores, sesiones bio, alertas del guardian
- **REST API** (`http://localhost:8080/api`): Consultas de estado, evidencia, modulos, configuracion

### Endpoints REST

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/status` | Estado global del sistema |
| GET | `/api/modules` | Lista de modulos disponibles |
| GET | `/api/evidence` | Cadena de evidencia EVOLIS |
| POST | `/api/evidence/verify` | Verificar integridad de la cadena |
| GET | `/api/bio/protocols` | Protocolos BioSoftware disponibles |
| GET | `/api/bio/state` | Estado actual de BioSoftware |
| GET | `/api/bio/stats` | Estadisticas de sesiones bio |
| GET | `/api/guardian/status` | Estado del Guardian Bacteriano |
| GET | `/api/usb/devices` | Lista de dispositivos USB y estado de puerto |
| POST | `/api/usb/block` | Bloquear puerto USB |
| POST | `/api/usb/unblock` | Desbloquear y vacunar puerto USB |
| POST | `/api/usb/authenticate` | Autenticar dispositivo USB |
| GET | `/api/sync/status` | Estado de sincronizacion P2P |
| POST | `/api/sync/transport` | Cambiar transporte de sincronizacion |
| POST | `/api/sync/connect-bluetooth` | Conectar Bluetooth |
| POST | `/api/sync/disconnect-bluetooth` | Desconectar Bluetooth |
| POST | `/api/command` | Procesar comando (texto) |
| POST | `/api/settings` | Actualizar configuracion |

### Mensajes WebSocket (TCREI)

Ver `server/tcrei-protocol.ts` para el formato completo.

## 2. Frontend — Flutter (Dart)

**Lenguaje:** Dart  
**Framework:** Flutter  
**Plataformas:** iOS, Android, Web, Desktop (Windows, macOS, Linux)

### Estructura

```
frontend/
  lib/
    main.dart                    Punto de entrada
    app.dart                     SentraApp (MaterialApp + tema)
    config/
      theme.dart                 Sistema de colores, tipografia, tema
      constants.dart             Constantes (URLs del backend, timeouts)
    models/
      tcrei_models.dart          Modelos TCREI (mensaje, respuesta, percepcion)
      module_def.dart            Definicion de modulo
      bio_session.dart           Sesion BioSoftware
      evidence_entry.dart        Entrada EVOLIS
      guardian_status.dart       Estado del guardian
      app_state.dart             Estado global de la app
    services/
      sentra_client.dart         Cliente WebSocket + REST
      state_notifier.dart        Gestor de estado (ChangeNotifier)
    widgets/
      voice_orb_button.dart      Orbe de voz bilateral (escuchar / hablar)
      accessible_header.dart     Cabecera accesible (modulo, veto, bio, bateria)
      module_drawer.dart         Cajon tactil de modulos (bottom sheet)
      response_banner.dart       Banner de respuesta / bloqueo etico
      status_chips.dart          Chips de estado (veto, bio, EVOLIS)
      bio_breath_guide.dart      Guia visual de respiracion (coherencia cardiaca)
      bio_protocol_card.dart     Tarjeta de protocolo bio
      evidence_chain_view.dart   Vista de cadena EVOLIS
      guardian_view.dart         Vista del guardian bacteriano
    screens/
      vision_screen.dart         Modo vision
      bio_screen.dart            Modo bio
      evidence_screen.dart       Modo evidencia
      learning_screen.dart       Modo aprendizaje
      game_screen.dart           Modo juego
      movement_screen.dart       Modo movimiento
      security_screen.dart       Modo seguridad
      silence_screen.dart        Modo silencio
      power_screen.dart          Modo impacto (energia)
      guardian_screen.dart       Modo guardian
      settings_screen.dart       Configuracion
  pubspec.yaml                   Dependencias Flutter
  README.md                      Guia de compilacion Flutter
```

### Accesibilidad

- **Semantics**: Todos los widgets interactivos exponen `Semantics` con `label`, `hint`, `value`
- **TalkBack** (Android): Soporte nativo via Flutter Semantics
- **VoiceOver** (iOS): Soporte nativo via Flutter Semantics
- **NVDA / JAWS** (Windows): Soporte via Flutter Desktop + UI Automation
- **ARIA** (Web): Flutter Web genera atributos ARIA automaticamente
- **Contraste**: Todos los colores cumplen WCAG 2.1 AA (ratio >= 4.5:1)
- **Focus visible**: Outline neon de 3px en todos los elementos focalizables
- **Tamanos tactiles**: Minimo 56px de altura en botones (64px en touch)

### Comunicacion con Backend

- **WebSocket**: Conexión persistente para eventos en tiempo real (voz, sensores, bio, guardian)
- **REST**: Consultas puntuales (estado, evidencia, modulos)
- **Reconexion automatica**: Exponential backoff con maximo 5 intentos
- **Offline**: El frontend mantiene estado local y sincroniza al reconectar

## 3. Capa de Comunicacion — Protocolo TCREI

**Formato:** JSON estructurado  
**Protocolos:** WebSocket (tiempo real), REST (consultas), IPC (desktop)

### Estructura del mensaje

```json
{
  "type": "command | query | event | response | error",
  "module": "vision | bio | evidencia | ...",
  "action": "process | start_session | stop_session | verify | ...",
  "payload": { ... },
  "timestamp": 1694123456789,
  "id": "uuid-v4"
}
```

### Tipos de mensaje

| Type | Direccion | Descripcion |
|------|-----------|-------------|
| `command` | Frontend → Backend | Comando del usuario (texto o voz) |
| `query` | Frontend → Backend | Consulta de estado o datos |
| `event` | Backend → Frontend | Notificacion push (alerta, bio tick, deteccion) |
| `response` | Backend → Frontend | Respuesta a command o query |
| `error` | Backend → Frontend | Error procesado |

### Eventos en tiempo real

| Event | Descripcion |
|-------|-------------|
| `perception.update` | Nuevos datos de percepcion (vision, sensores) |
| `bio.tick` | Actualizacion de sesion bio (coherencia, ciclos, reencuadre) |
| `bio.session_complete` | Sesion bio completada |
| `guardian.alert` | Nueva alerta del guardian |
| `guardian.state_change` | Cambio de estado del guardian (dormant → active → alert → quarantine) |
| `usb.port_change` | Cambio de estado de un puerto USB (blocked, allowed, infected) |
| `sync.transport_changed` | Cambio de transporte de sincronizacion P2P |
| `evidence.recorded` | Nueva entrada en la cadena EVOLIS |
| `moral.blocked` | Comando bloqueado por el filtro etico |
| `voice.response` | Respuesta de voz lista para sintetizar |
| `connection.status` | Cambio de estado de conexion (online/offline) |

## 4. Versiones y Compatibilidad

| Componente | Version | Lenguaje |
|------------|---------|----------|
| Sentra Core Motor | 4.0.0_BIO | TypeScript |
| Sentra Core API Server | 1.0.0 | TypeScript (Node.js) |
| Sentra Core Frontend | 1.0.0 | Dart (Flutter) |
| Protocolo TCREI | 4.0 | JSON |

## 5. Principios

1. **Offline-first**: Toda operacion funciona sin conexion a internet
2. **Veto humano estricto**: El veto humano siempre tiene prioridad
3. **Soberania del dato**: Los datos pertenecen al usuario, almacenados localmente
4. **Trazabilidad inalterable**: EVOLIS + firmas ECDSA P-256
5. **Modularidad**: Navaja suisa con 9+ modos de operacion
6. **Multiplataforma**: Celular + PC, UI adaptativa
7. **Sincronizacion P2P**: Syncthing / Bluetooth Mesh / LoRa
8. **Bio-Software Interface**: Inferencia activa, placebos cognitivos, neuroplasticidad, epigenetica, reencuadre cognitivo y coherencia cardiaca
9. **Accesibilidad nativa**: TalkBack, VoiceOver, NVDA, ARIA — sin soluciones parche

## 6. Preparacion para Verticales

- **Sentinel**: Modo de seguridad y monitoreo con sensores + EVOLIS + Guardian
- **Vision**: Asistencia visual con deteccion offline + descripcion por voz

Ambas verticales reutilizan el motor completo via la API server.

### Roadmap criptografico

ECDSA P-256 en Q1 2027.
