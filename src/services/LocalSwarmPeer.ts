export type SwarmSignal =
  | { kind: 'description'; description: RTCSessionDescriptionInit }
  | { kind: 'candidate'; candidate: RTCIceCandidateInit };

export type SwarmSignalSender = (peerId: string, signal: SwarmSignal) => void;
export type SwarmPeerState = 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';

interface PeerConnectionState {
  connection: RTCPeerConnection;
  channel: RTCDataChannel | null;
  pendingCandidates: RTCIceCandidateInit[];
}

export class LocalSwarmPeer {
  private peers = new Map<string, PeerConnectionState>();
  private messageListeners = new Set<(peerId: string, message: unknown) => void>();
  private stateListeners = new Set<(peerId: string, state: SwarmPeerState) => void>();

  onMessage(listener: (peerId: string, message: unknown) => void): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  onStateChange(listener: (peerId: string, state: SwarmPeerState) => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  async createOffer(peerId: string, sendSignal: SwarmSignalSender): Promise<void> {
    const peer = this.getOrCreatePeer(peerId, sendSignal);
    const channel = peer.connection.createDataChannel('sentra-swarm', { ordered: true });
    this.attachChannel(peerId, peer, channel);
    const offer = await peer.connection.createOffer();
    await peer.connection.setLocalDescription(offer);
    if (peer.connection.localDescription) {
      sendSignal(peerId, { kind: 'description', description: peer.connection.localDescription.toJSON() });
    }
  }

  async handleSignal(peerId: string, signal: SwarmSignal, sendSignal: SwarmSignalSender): Promise<void> {
    const peer = this.getOrCreatePeer(peerId, sendSignal);
    if (signal.kind === 'candidate') {
      if (peer.connection.remoteDescription) await peer.connection.addIceCandidate(signal.candidate);
      else peer.pendingCandidates.push(signal.candidate);
      return;
    }

    await peer.connection.setRemoteDescription(signal.description);
    for (const candidate of peer.pendingCandidates.splice(0)) {
      await peer.connection.addIceCandidate(candidate);
    }
    if (signal.description.type === 'offer') {
      const answer = await peer.connection.createAnswer();
      await peer.connection.setLocalDescription(answer);
      if (peer.connection.localDescription) {
        sendSignal(peerId, { kind: 'description', description: peer.connection.localDescription.toJSON() });
      }
    }
  }

  send(peerId: string, message: unknown): boolean {
    const channel = this.peers.get(peerId)?.channel;
    if (!channel || channel.readyState !== 'open') return false;
    channel.send(JSON.stringify(message));
    return true;
  }

  close(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (!peer) return;
    peer.channel?.close();
    peer.connection.close();
    this.peers.delete(peerId);
    this.emitState(peerId, 'closed');
  }

  closeAll(): void {
    for (const peerId of this.peers.keys()) this.close(peerId);
  }

  private getOrCreatePeer(peerId: string, sendSignal: SwarmSignalSender): PeerConnectionState {
    const existing = this.peers.get(peerId);
    if (existing) return existing;

    const connection = new RTCPeerConnection({ iceServers: [], iceCandidatePoolSize: 0 });
    const peer: PeerConnectionState = { connection, channel: null, pendingCandidates: [] };
    this.peers.set(peerId, peer);
    connection.onicecandidate = (event) => {
      if (event.candidate) sendSignal(peerId, { kind: 'candidate', candidate: event.candidate.toJSON() });
    };
    connection.ondatachannel = (event) => this.attachChannel(peerId, peer, event.channel);
    connection.onconnectionstatechange = () => {
      const state = connection.connectionState;
      if (state === 'new' || state === 'connecting') this.emitState(peerId, 'connecting');
      else if (state === 'connected') this.emitState(peerId, 'connected');
      else if (state === 'disconnected') this.emitState(peerId, 'disconnected');
      else if (state === 'failed') this.emitState(peerId, 'failed');
      else if (state === 'closed') this.emitState(peerId, 'closed');
    };
    return peer;
  }

  private attachChannel(peerId: string, peer: PeerConnectionState, channel: RTCDataChannel): void {
    peer.channel = channel;
    channel.onopen = () => this.emitState(peerId, 'connected');
    channel.onclose = () => this.emitState(peerId, 'disconnected');
    channel.onmessage = (event) => {
      try {
        const message = JSON.parse(String(event.data)) as unknown;
        for (const listener of this.messageListeners) listener(peerId, message);
      } catch {
        console.warn('[LocalSwarmPeer] Se descartó un mensaje no válido.');
      }
    };
  }

  private emitState(peerId: string, state: SwarmPeerState): void {
    for (const listener of this.stateListeners) listener(peerId, state);
  }
}
