from __future__ import annotations

import logging
import queue
import threading
import time
from typing import Optional

logger = logging.getLogger("sinerys.tts")
logger.addHandler(logging.NullHandler())

try:  # pragma: no cover - dependencia opcional
    import pyttsx3
except Exception:  # pragma: no cover
    pyttsx3 = None


class TextToSpeechEngine:
    """Wrapper offline para síntesis de voz con cola de mensajes."""

    def __init__(self, rate: int = 160, voice: Optional[str] = None, queue_size: int = 10) -> None:
        self.rate = rate
        self.voice = voice
        self._queue: "queue.Queue[str]" = queue.Queue(maxsize=queue_size)
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self._engine = None

        if pyttsx3 is not None:
            try:
                self._engine = pyttsx3.init()
                self._engine.setProperty("rate", self.rate)
                if self.voice:
                    self._engine.setProperty("voice", self.voice)
            except Exception as exc:
                logger.warning("No se pudo iniciar pyttsx3: %s", exc)
                self._engine = None

    def start(self) -> None:
        if self._thread is not None and self._thread.is_alive():
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run, name="sinerys-tts", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop_event.set()
        if self._thread is not None:
            self._thread.join(timeout=3.0)

    def say(self, text: str, block: bool = False) -> None:
        if not text or not text.strip():
            return
        try:
            self._queue.put_nowait(text.strip())
        except queue.Full:
            logger.warning("Cola TTS llena. Se descarta mensaje: %s", text)
        if block:
            time.sleep(min(1.5, max(0.4, len(text) * 0.025)))

    def _run(self) -> None:
        while not self._stop_event.is_set():
            try:
                text = self._queue.get(timeout=0.5)
            except queue.Empty:
                continue

            try:
                if self._engine is not None:
                    self._engine.say(text)
                    self._engine.runAndWait()
                else:
                    logger.info("[TTS] %s", text)
                    print(f"[TTS] {text}")
            except Exception as exc:
                logger.exception("Error al reproducir voz: %s", exc)

        while not self._queue.empty():
            try:
                self._queue.get_nowait()
            except Exception:
                break


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    tts = TextToSpeechEngine()
    tts.start()
    tts.say("Alerta de luminosidad baja.")
    time.sleep(2)
    tts.stop()
