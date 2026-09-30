import type { EvidenceDeltaBatch, StorageService } from './StorageService';
import { evolis } from '../core/EVOLIS';
import { evolisSourceIdFromPublicKey, sha256 } from '../lib/crypto';

const ITERATIONS = 310_000;
const MIN_PASSPHRASE_LENGTH = 12;
const MAX_PACKAGE_BYTES = 10 * 1024 * 1024;
const MAX_CHUNKS = 4096;
export async function getAirGapSourceId(): Promise<string> {
  await evolis.initialize();
  return evolisSourceIdFromPublicKey(evolis.getPublicKey());
}

export interface EncryptedAirGapPackage {
  format: 'sentra-airgap-package';
  version: 1;
  payloadType: 'delta' | 'acknowledgement';
  cipher: 'AES-256-GCM';
  kdf: 'PBKDF2-SHA-256';
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
}

export interface AirGapChunk {
  format: 'sentra-airgap-chunk';
  version: 1;
  transferId: string;
  index: number;
  total: number;
  checksum: string;
  data: string;
}

export interface AirGapImportResult {
  sourceId: string;
  exportId: string;
  appliedThrough: number;
  endingHash: string;
}

export interface AirGapAcknowledgement {
  format: 'sentra-airgap-acknowledgement';
  version: 1;
  sourceId: string;
  exportId: string;
  recipientId: string;
  lastIndex: number;
  lastHash: string;
  createdAt: number;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function deriveKey(passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

function validatePassphrase(passphrase: string): void {
  if (passphrase.length < MIN_PASSPHRASE_LENGTH) {
    throw new Error(`Air-gap passphrase must be at least ${MIN_PASSPHRASE_LENGTH} characters`);
  }
}

export async function encryptEvidenceDelta(
  batch: EvidenceDeltaBatch,
  passphrase: string,
): Promise<string> {
  return encryptPayload(batch, 'delta', passphrase);
}

async function encryptPayload(
  payload: unknown,
  payloadType: EncryptedAirGapPackage['payloadType'],
  passphrase: string,
): Promise<string> {
  validatePassphrase(passphrase);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt, ITERATIONS);
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  if (plaintext.byteLength > MAX_PACKAGE_BYTES) throw new Error('Air-gap package exceeds the size limit');
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  const envelope: EncryptedAirGapPackage = {
    format: 'sentra-airgap-package',
    version: 1,
    payloadType,
    cipher: 'AES-256-GCM',
    kdf: 'PBKDF2-SHA-256',
    iterations: ITERATIONS,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(encrypted)),
  };
  return JSON.stringify(envelope);
}

export async function decryptEvidenceDelta(
  serialized: string,
  passphrase: string,
): Promise<EvidenceDeltaBatch> {
  const batch = await decryptPayload<EvidenceDeltaBatch>(serialized, 'delta', passphrase);
  if (batch.formatVersion !== 1 || typeof batch.sourceId !== 'string' || !Array.isArray(batch.entries)) {
    throw new Error('Air-gap package does not contain an evidence delta');
  }
  return batch;
}

async function decryptPayload<T>(
  serialized: string,
  payloadType: EncryptedAirGapPackage['payloadType'],
  passphrase: string,
): Promise<T> {
  validatePassphrase(passphrase);
  if (new TextEncoder().encode(serialized).byteLength > MAX_PACKAGE_BYTES * 2) {
    throw new Error('Air-gap package exceeds the size limit');
  }
  let envelope: EncryptedAirGapPackage;
  try {
    envelope = JSON.parse(serialized) as EncryptedAirGapPackage;
  } catch {
    throw new Error('Air-gap package is not valid JSON');
  }
  if (envelope.format !== 'sentra-airgap-package' || envelope.version !== 1 || envelope.payloadType !== payloadType
    || envelope.cipher !== 'AES-256-GCM' || envelope.kdf !== 'PBKDF2-SHA-256'
    || !Number.isInteger(envelope.iterations) || envelope.iterations < 100_000 || envelope.iterations > 1_000_000) {
    throw new Error('Unsupported air-gap package metadata');
  }

  const key = await deriveKey(passphrase, fromBase64(envelope.salt), envelope.iterations);
  let plaintext: ArrayBuffer;
  try {
    plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: toArrayBuffer(fromBase64(envelope.iv)) },
      key,
      toArrayBuffer(fromBase64(envelope.ciphertext)),
    );
  } catch {
    throw new Error('Air-gap package authentication failed');
  }
  if (plaintext.byteLength > MAX_PACKAGE_BYTES) throw new Error('Air-gap package exceeds the size limit');
  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}

export async function encryptAirGapAcknowledgement(
  acknowledgement: AirGapAcknowledgement,
  passphrase: string,
): Promise<string> {
  return encryptPayload(acknowledgement, 'acknowledgement', passphrase);
}

export async function decryptAirGapAcknowledgement(
  serialized: string,
  passphrase: string,
): Promise<AirGapAcknowledgement> {
  const acknowledgement = await decryptPayload<AirGapAcknowledgement>(serialized, 'acknowledgement', passphrase);
  if (acknowledgement.format !== 'sentra-airgap-acknowledgement' || acknowledgement.version !== 1
    || !acknowledgement.sourceId || !acknowledgement.exportId || !acknowledgement.recipientId
    || !Number.isInteger(acknowledgement.lastIndex) || acknowledgement.lastIndex < 0
    || !/^[0-9a-f]{64}$/i.test(acknowledgement.lastHash)) {
    throw new Error('Air-gap acknowledgement is invalid');
  }
  return acknowledgement;
}

export async function splitAirGapPackage(serialized: string, chunkSize = 24 * 1024): Promise<AirGapChunk[]> {
  if (!Number.isInteger(chunkSize) || chunkSize < 1024 || chunkSize > 256 * 1024) {
    throw new Error('Air-gap chunk size must be between 1 KB and 256 KB');
  }
  const bytes = new TextEncoder().encode(serialized);
  if (bytes.byteLength > MAX_PACKAGE_BYTES * 2) throw new Error('Air-gap package exceeds the size limit');
  const total = Math.ceil(bytes.byteLength / chunkSize);
  if (total < 1 || total > MAX_CHUNKS) throw new Error('Air-gap package has an invalid chunk count');
  const checksum = await sha256(serialized);
  const transferId = crypto.randomUUID();
  return Array.from({ length: total }, (_, index) => ({
    format: 'sentra-airgap-chunk',
    version: 1,
    transferId,
    index,
    total,
    checksum,
    data: toBase64(bytes.slice(index * chunkSize, (index + 1) * chunkSize)),
  }));
}

export async function joinAirGapChunks(chunks: AirGapChunk[]): Promise<string> {
  if (chunks.length < 1 || chunks.length > MAX_CHUNKS) throw new Error('Invalid air-gap chunk count');
  const first = chunks[0];
  if (first.format !== 'sentra-airgap-chunk' || first.version !== 1
    || first.total !== chunks.length || !first.transferId || !first.checksum) {
    throw new Error('Invalid air-gap chunk metadata');
  }
  const ordered = new Array<AirGapChunk>(first.total);
  for (const chunk of chunks) {
    if (chunk.format !== first.format || chunk.version !== first.version
      || chunk.transferId !== first.transferId || chunk.total !== first.total || chunk.checksum !== first.checksum
      || !Number.isInteger(chunk.index) || chunk.index < 0 || chunk.index >= first.total || ordered[chunk.index]) {
      throw new Error('Air-gap chunks do not belong to one complete transfer');
    }
    ordered[chunk.index] = chunk;
  }
  const byteChunks = ordered.map((chunk) => fromBase64(chunk.data));
  const totalBytes = byteChunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  if (totalBytes > MAX_PACKAGE_BYTES * 2) throw new Error('Air-gap package exceeds the size limit');
  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of byteChunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const serialized = new TextDecoder().decode(bytes);
  if (await sha256(serialized) !== first.checksum) throw new Error('Air-gap chunk checksum mismatch');
  return serialized;
}

export async function exportAirGapDelta(
  storage: StorageService,
  peerId: string,
  sourceId: string,
  passphrase: string,
  chunkSize?: number,
): Promise<AirGapChunk[]> {
  const batch = await storage.exportEvidenceDeltaForPeer(peerId, sourceId);
  return splitAirGapPackage(await encryptEvidenceDelta(batch, passphrase), chunkSize);
}

export async function importAirGapDelta(
  storage: StorageService,
  chunks: AirGapChunk[],
  peerId: string | undefined,
  passphrase: string,
): Promise<AirGapImportResult> {
  const serialized = await joinAirGapChunks(chunks);
  const batch = await decryptEvidenceDelta(serialized, passphrase);
  const appliedThrough = await storage.applyEvidenceDelta(batch, peerId ?? batch.sourceId);
  return { sourceId: batch.sourceId, exportId: batch.exportId, appliedThrough, endingHash: batch.endingHash };
}

interface AirGapTransferFile {
  format: 'sentra-airgap-transfer';
  version: 1;
  kind: 'delta' | 'acknowledgement';
  chunks: AirGapChunk[];
}

export async function downloadAirGapDeltaFile(
  storage: StorageService,
  peerId: string,
  sourceId: string,
  passphrase: string,
  chunkSize?: number,
): Promise<number> {
  const chunks = await exportAirGapDelta(storage, peerId, sourceId, passphrase, chunkSize);
  const transferFile: AirGapTransferFile = { format: 'sentra-airgap-transfer', version: 1, kind: 'delta', chunks };
  const blob = new Blob([JSON.stringify(transferFile)], { type: 'application/vnd.sentra.airgap+json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `sentra-airgap-${sourceId}-${Date.now()}.json`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return chunks.length;
}

export async function importAirGapDeltaFile(
  storage: StorageService,
  file: File,
  passphrase: string,
): Promise<AirGapImportResult> {
  if (file.size > MAX_PACKAGE_BYTES * 2) throw new Error('Air-gap file exceeds the size limit');
  let transferFile: AirGapTransferFile;
  try {
    transferFile = JSON.parse(await file.text()) as AirGapTransferFile;
  } catch {
    throw new Error('Air-gap file is not valid JSON');
  }
  if (transferFile.format !== 'sentra-airgap-transfer' || transferFile.version !== 1
    || transferFile.kind !== 'delta' || !Array.isArray(transferFile.chunks)) {
    throw new Error('Unsupported air-gap file format');
  }
  return importAirGapDelta(storage, transferFile.chunks, undefined, passphrase);
}

export async function downloadAirGapAcknowledgementFile(
  result: AirGapImportResult,
  receiverId: string,
  passphrase: string,
): Promise<number> {
  const chunks = await createAirGapAcknowledgementChunks(result, receiverId, passphrase);
  const transferFile: AirGapTransferFile = { format: 'sentra-airgap-transfer', version: 1, kind: 'acknowledgement', chunks };
  const blob = new Blob([JSON.stringify(transferFile)], { type: 'application/vnd.sentra.airgap+json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `sentra-airgap-ack-${receiverId}-${Date.now()}.json`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return chunks.length;
}

export async function createAirGapAcknowledgementChunks(
  result: AirGapImportResult,
  receiverId: string,
  passphrase: string,
): Promise<AirGapChunk[]> {
  if (!receiverId.trim() || result.appliedThrough < 0) throw new Error('No imported evidence is available to acknowledge');
  const acknowledgement: AirGapAcknowledgement = {
    format: 'sentra-airgap-acknowledgement',
    version: 1,
    sourceId: result.sourceId,
    exportId: result.exportId,
    recipientId: receiverId,
    lastIndex: result.appliedThrough,
    lastHash: result.endingHash,
    createdAt: Date.now(),
  };
  return splitAirGapPackage(await encryptAirGapAcknowledgement(acknowledgement, passphrase));
}

export async function importAirGapAcknowledgementFile(
  storage: StorageService,
  file: File,
  expectedPeerId: string,
  passphrase: string,
): Promise<AirGapAcknowledgement> {
  if (file.size > MAX_PACKAGE_BYTES * 2) throw new Error('Air-gap file exceeds the size limit');
  let transferFile: AirGapTransferFile;
  try {
    transferFile = JSON.parse(await file.text()) as AirGapTransferFile;
  } catch {
    throw new Error('Air-gap acknowledgement file is not valid JSON');
  }
  if (transferFile.format !== 'sentra-airgap-transfer' || transferFile.version !== 1
    || transferFile.kind !== 'acknowledgement' || !Array.isArray(transferFile.chunks)) {
    throw new Error('Unsupported air-gap acknowledgement format');
  }
  const serialized = await joinAirGapChunks(transferFile.chunks);
  return importAirGapAcknowledgement(storage, serialized, expectedPeerId, passphrase);
}

export async function importAirGapAcknowledgement(
  storage: StorageService,
  serialized: string,
  expectedPeerId: string,
  passphrase: string,
): Promise<AirGapAcknowledgement> {
  const acknowledgement = await decryptAirGapAcknowledgement(serialized, passphrase);
  if (acknowledgement.recipientId !== expectedPeerId) {
    throw new Error('Air-gap acknowledgement is for a different peer');
  }
  await storage.acknowledgeEvidenceDelta(
    acknowledgement.recipientId,
    acknowledgement.sourceId,
    acknowledgement.exportId,
    acknowledgement.lastIndex,
    acknowledgement.lastHash,
  );
  return acknowledgement;
}