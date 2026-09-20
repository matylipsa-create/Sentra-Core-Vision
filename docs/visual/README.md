# Sentra Core · Mapa visual

Esta carpeta reúne diagramas de lectura rápida para presentar el activo técnico a equipos de producto, aliados institucionales y potenciales integradores.

## La tesis en una imagen

```mermaid
flowchart LR
  I["Entradas<br/>sensores · cámara · voz"] --> M["Sentra Core<br/>motor soberano"]
  M --> V["Veto humano<br/>determinista"]
  M --> T["Trazabilidad<br/>EVOLIS"]
  M --> O["Salidas<br/>voz · háptica · UI · hardware"]
  V --> O
  T --> O
```

**El motor es el activo. La interfaz es un botón.** La misma lógica puede expresarse en una PWA, una app Flutter, un backend o un Tótem de campo.

## Las cuatro capas

```mermaid
mindmap
  root((Sentra Core))
    Núcleo Determinista
      MoralNode
      veto humano
      EVOLIS
      decisiones reversibles
    Puente Sensorial
      cámara
      voz
      OCR
      IMU y GPS
      LoRa
    Motor Narrativo
      TCREI
      contexto
      inclinaciones
      aprendizaje
      modos
    Orquestación Estética
      TTS
      audio espacial
      háptica
      UI adaptativa
```

## De una señal a una respuesta

```mermaid
stateDiagram-v2
  [*] --> Percibir
  Percibir --> Normalizar
  Normalizar --> Evaluar
  Evaluar --> Bloqueado: veto humano o regla
  Evaluar --> Interpretar: autorizado
  Interpretar --> Expresar
  Expresar --> Registrar
  Bloqueado --> Registrar
  Registrar --> [*]
```

## Portabilidad del núcleo

```mermaid
flowchart TB
  Core["Sentra Core<br/>reglas · contexto · evidencia"]
  Core --> PWA["PWA / Sentra Vision"]
  Core --> Flutter["Flutter móvil"]
  Core --> API["API + WebSocket"]
  Core --> Totem["Tótem 2.0<br/>ESP32 + LoRa"]
  PWA --> User["usuario final"]
  Flutter --> User
  API --> Integrations["integraciones"]
  Totem --> Field["operación de campo"]
```

## Lectura para una demo

1. **Percepción:** una señal entra desde cámara, voz o sensor.
2. **Control:** el Núcleo Determinista evalúa reglas y veto humano.
3. **Contexto:** el Motor Narrativo decide cómo traducir la señal.
4. **Experiencia:** la Orquestación expresa el resultado con la menor carga posible.
5. **Evidencia:** EVOLIS deja una entrada verificable, tanto si la acción fue permitida como bloqueada.

## Documentos relacionados

- [README principal](../../README.md)
- [Arquitectura detallada](../../ARCHITECTURE.md)
- [Arquitectura multimodal](../MULTIMODAL_INTERFACE_ARCHITECTURE.md)
- [Protocolo LoRa](../LORA_PROTOCOL_ARCHITECTURE.md)
- [Arquitectura cuantizada](../QUANTIZED_AI_ARCHITECTURE.md)
