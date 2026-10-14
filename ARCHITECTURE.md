# Sentra Core Vision — Practical Architecture

This document describes the actual shape of the repository and the architecture that matches the current stage of the project.

## 1. Project goal

Sentra Core Vision is an accessible, modular, practical platform for visual perception, monitoring and useful human-centered applications.

The current phase is focused on:
- clear user-facing applications
- accessibility and usability
- modular visual workflows
- event-driven integrations
- optional perception services for cameras and sensors

This is not a fully-finished autonomous system or a mythical engine marketed as all-in-one intelligence. It is a foundation for real use cases.

## 2. Repository structure

```text
Sentra-Core-Vision/
├── README.md
├── ARCHITECTURE.md
├── index.html
├── .github/
├── .vscode/
├── frontend/
│   ├── README.md
│   ├── pubspec.yaml
│   ├── lib/
│   ├── android/
│   ├── ios/
│   ├── web/
│   └── test/
├── server/
│   └── vision/
│       ├── __init__.py
│       ├── README.md
│       ├── core.py
│       ├── tts.py
│       ├── requirements.txt
│       └── ...
└── docs/
```

## 3. Frontend layer

The frontend is implemented with Flutter and Dart.

Responsibilities:
- app shell and navigation
- accessibility profiles
- module-based screens
- monitoring and reporting UI
- real-time event rendering
- user interaction with vision and operational tools

Main areas:
- `frontend/lib/app.dart`
- `frontend/lib/screens/`
- `frontend/lib/services/`
- `frontend/lib/models/`
- `frontend/lib/config/`

Example modules already represented in the app conceptually:
- vision
- bio
- evidence
- guardian
- learning
- movement
- security
- silence

## 4. Signal flow

```text
Camera / stream source
        │
        ▼
Optional Python perception service
        │
        ├─ frame capture
        ├─ motion / luminosity / scene analysis
        ├─ event generation
        └─ JSON payload publication
        │
        ▼
Event bus / integration layer
        │
        ├─ WebSocket or REST bridge
        ├─ frontend updates
        └─ user-facing alerts / UI states
```

## 5. Optional perception service

The repository includes a lightweight Python perception module under `server/vision/`.

It is intended for:
- webcam testing
- RTSP/MJPEG stream support
- motion or scene detection
- event generation for visual monitoring
- optional audio announcements with TTS

This service is intentionally simple and modular. It exists to support practical experimentation without making the repository depend on a heavy enterprise backend.

## 6. Communication model

The current architecture follows a practical event model rather than a complex all-encompassing protocol.

Example event structure:

```json
{
  "type": "event",
  "module": "vision",
  "action": "perception.update",
  "payload": {
    "event_type": "scene_snapshot",
    "source": "camera_main",
    "confidence": 0.7,
    "metadata": {
      "luminosidad": 84.2,
      "estado_escena": "normal"
    },
    "timestamp": "2026-10-14T03:55:00Z"
  }
}
```

This format is simple, readable and easy to consume in Flutter or Python.

## 7. Realistic roadmap

### Phase 1 — usable applications
- accessible UI polish
- module stabilization
- camera integration prototypes
- monitoring dashboards
- event-driven communication

### Phase 2 — operational tools
- real camera workflows
- more robust detection modules
- better dashboard telemetry
- optional backend service layer

### Phase 3 — productization
- deployment-focused configuration
- device management
- performance tuning
- user validation and product refinement

## 8. Design principles

- useful before impressive
- accessibility before decoration
- simple architecture before complexity
- real user value over narrative abstraction
- modularity without over-engineering

## 9. Status

This repository is best understood as an evolving platform for useful, real-world applications — especially in visual assistance, environmental monitoring and accessible interface design.

The project is intentionally practical and focused on solving concrete user needs, rather than presenting itself as a grandiose engine with impossible scope.
