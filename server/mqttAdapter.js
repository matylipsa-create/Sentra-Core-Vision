import mqtt from 'mqtt';

const TELEMETRY_TOPIC = 'sentra/swarm/+/telemetry';

/** Bridges MQTT telemetry into the Sentra Core event interface. */
class MQTTAdapter {
  constructor(httpServer, coreEngine) {
    this.httpServer = httpServer;
    this.coreEngine = coreEngine;
    this.client = null;
    this.brokerUrl = process.env.MQTT_BROKER_URL ?? 'mqtt://localhost:1883';
  }

  init() {
    if (this.client) return;

    console.info(`[MQTTAdapter] Inicializando conexión con el broker en: ${this.brokerUrl}`);
    this.client = mqtt.connect(this.brokerUrl, {
      clientId: `sentra_core_server_${Math.random().toString(16).substring(2, 8)}`,
      clean: true,
      reconnectPeriod: 5000,
    });

    this.client.on('connect', () => {
      console.info('[MQTTAdapter] ¡Conectado exitosamente al Broker MQTT!');
      this.client.subscribe(TELEMETRY_TOPIC, { qos: 1 }, (error) => {
        if (error) {
          console.error('[MQTTAdapter] Error al suscribirse al tópico de telemetría:', error);
          return;
        }
        console.info(`[MQTTAdapter] Suscripto correctamente al tópico: ${TELEMETRY_TOPIC}`);
      });
    });

    this.client.on('message', (topic, payloadBuffer) => {
      this.handleIncomingMessage(topic, payloadBuffer);
    });

    this.client.on('error', (error) => {
      console.error('[MQTTAdapter] Error en el cliente MQTT:', error);
    });
  }

  handleIncomingMessage(topic, payloadBuffer) {
    try {
      const data = JSON.parse(payloadBuffer.toString());
      const topicSegments = topic.split('/');
      const extractedNodeId = topicSegments[2] || 'UNKNOWN_NODE';
      const sentinelEvent = {
        source: extractedNodeId,
        type: 'TELEMETRY_INGEST',
        timestamp: Date.now(),
        data,
      };

      if (this.coreEngine && typeof this.coreEngine.onSentinelEvent === 'function') {
        this.coreEngine.onSentinelEvent(sentinelEvent);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[MQTTAdapter] Error crítico al parsear JSON del payload MQTT:', message);
    }
  }

  async shutdown() {
    if (!this.client) return;

    const client = this.client;
    this.client = null;
    await new Promise((resolve) => {
      client.end(false, {}, () => {
        console.info('[MQTTAdapter] Conexión MQTT cerrada correctamente.');
        resolve();
      });
    });
  }
}

export default MQTTAdapter;