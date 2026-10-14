# Sentra Core Frontend

This folder contains the Flutter app for the Sentra Core Vision project.

## Current role

The frontend is the main user-facing layer of the project. It presents the experience and provides the interface for:
- vision-related workflows
- monitoring and alerting views
- accessibility profiles
- modular interaction and navigation
- real-time updates from the companion perception layer

## Tech stack

- Flutter
- Dart
- Material 3
- accessibility-first UI

## Run locally

```bash
cd frontend
flutter pub get
flutter run
```

Web:

```bash
flutter run -d chrome
```

Android build:

```bash
flutter build apk
```

## Project structure

```text
frontend/
├── lib/
│   ├── app.dart
│   ├── config/
│   ├── models/
│   ├── screens/
│   ├── services/
│   └── widgets/
├── android/
├── ios/
├── web/
├── pubspec.yaml
├── README.md
└── test/
```

## Current phase

This frontend is part of a practical evolution toward useful applications, not a fictional all-encompassing platform. It is designed to be stable, readable and flexible enough to grow into real product workflows.

## Optional backend integration

The frontend can connect to a local Python vision service or another lightweight event source. The recommended pattern is:
- REST for state queries
- WebSocket for live event streams
- structured JSON payloads

## Accessibility goals

- strong contrast and readable layouts
- large touch targets
- speaker-friendly feedback models
- support for blind, low vision and deaf-blind profiles
- simple, understandable interaction patterns
