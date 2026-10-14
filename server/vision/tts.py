import pyttsx3


class AsistenteVozSinerys:
    def __init__(self):
        self.engine = pyttsx3.init()
        self.engine.setProperty("rate", 170)

    def anunciar(self, texto: str):
        print(f"[VOZ] {texto}")
        self.engine.say(texto)
        self.engine.runAndWait()
