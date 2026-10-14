# Vision service

A lightweight Python module for camera-driven event generation and optional speech feedback.

## Purpose

This service is designed to support practical computer-vision workflows in a simple, maintainable way.

It can be used to:
- read frames from a webcam or network stream
- detect basic motion or light changes
- emit structured JSON events
- send alerts to a frontend or local integration layer
- announce key events with a TTS engine

## Install

```bash
cd server/vision
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Example

```python
from core import SinerysVisionEngine
import time

vision = SinerysVisionEngine(camera_index=0)
vision.iniciar_captura()

try:
    for _ in range(20):
        event = vision.procesar_frame()
        if event is not None:
            print(event)
        time.sleep(1)
finally:
    vision.detener()
```

## Notes

This is intentionally simple and usable. It is a solid starting point for real integrations without requiring a heavy processing pipeline from day one.
