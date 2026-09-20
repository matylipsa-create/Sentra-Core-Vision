# Integracion de RF energy harvesting

## Entrada al motor

El nodo LoRa del Totem 2.0 puede entregar energia cosechada por RF y usar la bateria como respaldo. La Capa 1 representa esa disponibilidad en `PowerManager`: la fuente puede ser red, bateria, harvesting o un modo hibrido; la energia cosechada se almacena en mWh con un limite de 1000 mWh y el presupuesto se normaliza entre 0 y 100.

`EnergyAwareScheduler` consulta el presupuesto antes de transmitir, decide el intervalo y solicita la lista de sensores adecuada. `SensorPriorityManager` conserva los sensores criticos cuando el presupuesto es bajo y habilita capacidades opcionales cuando hay margen.

## Cuatro conceptos

- **Soberania:** el nodo decide localmente que puede ejecutar y cuando transmitir, sin depender de una nube.
- **Priorizacion:** PIR, camara y microfono permanecen primero; IMU, GPS y temperatura son estandar; OCR, VLM y audio 3D son opcionales.
- **Transmision adaptativa:** con presupuesto alto transmite cada 5 minutos; en cualquier nivel inferior usa un ciclo de 15 minutos y solo transmite desde el umbral operativo.
- **Resiliencia:** ante una falla de red, `FailoverManager` cambia a harvesting; al restaurarse, vuelve a grid. La bateria sigue disponible como fuente de respaldo.

## Flujo completo

```text
cosecha RF -> almacena mWh -> calcula presupuesto -> prioriza sensores
-> decide transmision -> registra el ciclo en EVOLIS
```

Los cambios de fuente se registran como `power:source_change` y cada ciclo como `power:energy_cycle`, manteniendo la trazabilidad de EVOLIS.

## Roadmap Q1 2027

1. Integrar lecturas reales del controlador de RF mediante el adaptador de Capa 1.
2. Calibrar presupuesto, umbrales e intervalos con mediciones del Totem 2.0.
3. Validar failover grid, harvesting y bateria en pruebas de campo.
4. Incorporar telemetria de eficiencia y alertas de autonomia sin modificar el firmware C++.