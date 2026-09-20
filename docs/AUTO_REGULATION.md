# Auto-regulacion segun hardware

Sentra Core conserva sus capacidades existentes y añade una capa TypeScript que adapta la configuracion al dispositivo donde se ejecuta. La regulacion es local y no modifica el firmware C++.

## Cinco ejes

- **Energia:** identifica red, bateria o harvesting y reduce sensores cuando el presupuesto cae por debajo de 20.
- **Sensores:** habilita un conjunto proporcional a las capacidades detectadas y prioriza los sensores criticos.
- **Computo:** selecciona modelo lite o full y backend CPU, WebGL o WebGPU.
- **Conectividad:** consulta el estado online y, cuando no hay red, mantiene la operacion local y alarga la frecuencia de transmision.
- **Accesibilidad:** detecta vibracion, TTS y preferencias de asistencia para conservar canales alternativos de interaccion.

## Deteccion de hardware

`HardwareProfiler` inspecciona el user agent, numero de nucleos, memoria disponible, APIs de camara, geolocalizacion, movimiento, WebGL/WebGPU, vibracion y sintesis de voz. Tambien identifica el Totem 2.0 cuando el entorno declara Totem o Sentra/LoRa en el user agent. El perfil resultante queda disponible como `HardwareProfile`.

## Adaptacion del motor

`AutoRegulator` combina el perfil, la energia y la conectividad para producir un `OptimalConfig`. Los equipos de baja capacidad usan deteccion lite y CPU; los medios usan el modelo full con WebGL; los altos usan full con WebGPU cuando existe. El intervalo base es 15 minutos en movil, 1 minuto en desktop y 5 minutos en Totem. Sin conectividad se prioriza el procesamiento local.

## Ejemplos

Un celular de gama baja queda con camara e IMU, modelo lite y CPU, con transmisiones espaciadas. Un Totem 2.0 usa camara, PIR, temperatura, humedad y LoRa, aprovecha harvesting o modo hibrido, y mantiene un ciclo de transmision de 5 minutos.

## Beneficios

- **Portabilidad:** una misma Capa 1 se ajusta a celular, tablet, PC y Totem.
- **Eficiencia:** el trabajo se escala a la energia, sensores y computo realmente disponibles.
- **Soberania:** la decision de operacion ocurre localmente y el modo offline no depende de servicios externos.