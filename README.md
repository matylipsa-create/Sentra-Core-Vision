# Sentra Core Vision

Sentra Core Vision is a practical, accessibility-first project focused on useful applications around visual perception, monitoring, and human-centered interfaces.

This repository is currently in an evolution phase: the goal is not to pretend to be a complete autonomous operating system, but to build usable tools with real value for people.

## What this repo actually contains

- Flutter frontend for Android, iOS, Web and Desktop
- accessible interface design for low vision, total blindness and deaf-blind profiles
- modular screens for vision, security, movement, evidence, learning and more
- a lightweight event-driven architecture ready for camera and sensor integrations
- an optional Python perception service for camera streams and event generation

## Current phase

This project is in the "useful applications" phase.

That means:
- practical UX over theoretical complexity
- accessibility as a first-class requirement
- real-world integrations, not marketing-heavy abstraction
- a modular platform that can evolve into more specialized products

## Repository structure

```text
.
├── README.md
├── ARCHITECTURE.md
├── index.html
├── .github/
├── .vscode/
├── frontend/
│   ├── lib/
│   ├── android/
│   ├── ios/
│   ├── web/
│   ├── pubspec.yaml
│   └── README.md
├── server/
│   └── vision/
│       ├── __init__.py
│       ├── core.py
│       ├── tts.py
│       ├── README.md
│       ├── requirements.txt
│       └── ...
└── docs/
```

## Main product direction

The project is aimed at useful, human-centered scenarios such as:

- vision assistance and scene understanding
- security monitoring and alerting
- digital twins and environment perception
- human access to information through audio, haptics and high-contrast UI
- practical tools for operators and end users

## Run the app

From the repository root:

```bash
cd frontend
flutter pub get
flutter run
```

Optional web target:

```bash
flutter run -d chrome
```

Optional Android build:

```bash
flutter build apk
```

## Optional perception service

A Python vision layer is included as an optional companion for camera-based event processing.

See:

```bash
server/vision/README.md
```

This layer is intentionally lightweight and modular, designed for experimentation and practical integrations without forcing a full enterprise backend.

## Architecture at a glance

```text
Frontend (Flutter / Dart)
        │
        ├─ UI and interactions
        ├─ accessibility profiles
        ├─ live modules and dashboards
        └─ WebSocket/REST integration
        │
        v
Optional perception service (Python + OpenCV)
        │
        ├─ camera capture
        ├─ motion/luminosity/event detection
        ├─ structured JSON events
        └─ optional TTS output
        │
        v
Event bus / app integration layer
        │
        ├─ real-time updates
        ├─ dashboard telemetry
        └─ downstream visual or audio reactions
```

## Principles

- useful before spectacular
- accessibility before visual polish
- practical integrations over abstraction
- simple architecture that can scale carefully
- real user value over synthetic complexity

## Status summary

This repository is not presented as a complete sovereign AI engine or universal system. It is a current working foundation for a practical vision platform with a clear direction toward useful, accessible applications.

## License

MIT © 2026 Matías Ariel Lipari
