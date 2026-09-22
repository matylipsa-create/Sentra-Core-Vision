export interface TelemetryPacket {
  nodeId: string;
  timestamp: number;
  telemetry: {
    lat: number;
    lon: number;
    altitude: number;
    velocityVector: {
      x: number;
      y: number;
      z: number;
    };
    targetLocked: boolean;
  };
  signature?: string;
}

export interface SwarmTransport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribeToSwarm(callback: (packet: TelemetryPacket) => void): void;
  publishCommand(nodeId: string, command: string, payload: Record<string, unknown>): Promise<void>;
}

/** Simulated swarm transport for development and real-time UI testing. */
export class MockSwarmTransport implements SwarmTransport {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly subscribers: Array<(packet: TelemetryPacket) => void> = [];
  private isConnected = false;

  public async connect(): Promise<void> {
    if (this.isConnected) return;

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        console.info('[MockSwarmTransport] Conectado al enjambre simulado.');
        this.startSimulationStream();
        resolve();
      }, 500);
    });
  }

  public async disconnect(): Promise<void> {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isConnected = false;
    console.info('[MockSwarmTransport] Desconectado del enjambre simulado.');
  }

  public subscribeToSwarm(callback: (packet: TelemetryPacket) => void): void {
    this.subscribers.push(callback);
  }

  public async publishCommand(
    nodeId: string,
    command: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    if (!this.isConnected) {
      throw new Error('[MockSwarmTransport] No se puede enviar comando: transporte desconectado.');
    }
    console.info(`[MockSwarmTransport] Comando enviado a nodo [${nodeId}] -> ${command}:`, payload);
  }

  private startSimulationStream(): void {
    const mockNodes = ['SENTINEL-01', 'SENTINEL-02', 'SENTINEL-03'];

    this.intervalId = setInterval(() => {
      if (!this.isConnected) return;

      const targetNode = mockNodes[Math.floor(Math.random() * mockNodes.length)];
      const packet: TelemetryPacket = {
        nodeId: targetNode,
        timestamp: Date.now(),
        telemetry: {
          lat: -38.0055 + (Math.random() - 0.5) * 0.01,
          lon: -57.5426 + (Math.random() - 0.5) * 0.01,
          altitude: 15 + Math.random() * 5,
          velocityVector: {
            x: Number((Math.random() * 2).toFixed(2)),
            y: Number((Math.random() * 2).toFixed(2)),
            z: Number((Math.random() * 0.5).toFixed(2)),
          },
          targetLocked: Math.random() > 0.7,
        },
        signature: `mock_sig_${Math.random().toString(36).substring(2, 8)}`,
      };

      this.subscribers.forEach((subscriber) => subscriber(packet));
    }, 1500);
  }
}