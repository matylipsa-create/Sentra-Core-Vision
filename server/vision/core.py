import cv2
import time
from datetime import datetime, timezone


class SinerysVisionEngine:
    def __init__(self, camera_index=0, width=640, height=480):
        self.camera_index = camera_index
        self.width = width
        self.height = height
        self.cap = None

    def iniciar_captura(self):
        self.cap = cv2.VideoCapture(self.camera_index)
        if not self.cap.isOpened():
            raise RuntimeError("No se pudo abrir la cámara.")
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
        print("[VISION] Stream iniciado.")

    def procesar_frame(self):
        if not self.cap or not self.cap.isOpened():
            return None

        ret, frame = self.cap.read()
        if not ret:
            return None

        frame_resized = cv2.resize(frame, (self.width, self.height))
        gray = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2GRAY)
        brillo = float(gray.mean())

        event = {
            "type": "event",
            "module": "vision",
            "action": "perception.update",
            "payload": {
                "event_type": "scene_snapshot",
                "source": "camera_main",
                "confidence": 0.7,
                "metadata": {
                    "luminosidad": round(brillo, 2),
                    "estado_escena": "oscura" if brillo < 50 else "normal",
                    "resolution": [self.width, self.height],
                },
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        }

        if brillo < 30:
            event["payload"]["alerta"] = "Baja luminosidad detectada"

        return event

    def procesar_frame(self):
        if not self.cap or not self.cap.isOpened():
            return None

        ret, frame = self.cap.read()
        if not ret:
            return None

        frame_resized = cv2.resize(frame, (self.width, self.height))
        gray = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2GRAY)
        brillo = float(gray.mean())

        event = {
            "type": "event",
            "module": "vision",
            "action": "perception.update",
            "payload": {
                "event_type": "scene_snapshot",
                "source": "camera_main",
                "confidence": 0.7,
                "metadata": {
                    "luminosidad": round(brillo, 2),
                    "estado_escena": "oscura" if brillo < 50 else "normal",
                    "resolution": [self.width, self.height],
                },
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        }

        if brillo < 30:
            event["payload"]["alerta"] = "Baja luminosidad detectada"

        return event

    def detener(self):
        if self.cap:
            self.cap.release()
            self.cap = None
            print("[VISION] Stream detenido.")


if __name__ == "__main__":
    vision = SinerysVisionEngine(camera_index=0)
    vision.iniciar_captura()
    try:
        for _ in range(10):
            event = vision.procesar_frame()
            if event is not None:
                print(event)
            time.sleep(1)
    finally:
        vision.detener()
