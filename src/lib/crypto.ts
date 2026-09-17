export type HashHex = string;

export async function sha256(data: string): Promise<HashHex> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function uuidv4(): string {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface HashChainEntry {
  index: number;
  hash: HashHex;
  previousHash: HashHex;
  timestamp: number;
  data: string;
}

export async function createHashChainEntry(
  index: number,
  previousHash: HashHex,
  data: string
): Promise<HashChainEntry> {
  const timestamp = Date.now();
  const composite = `${index}:${previousHash}:${timestamp}:${data}`;
  const hash = await sha256(composite);
  return { index, hash, previousHash, timestamp, data };
}

export async function verifyHashChain(entries: HashChainEntry[]): Promise<boolean> {
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const expectedPrev = i === 0 ? '0'.repeat(64) : entries[i - 1].hash;
    if (entry.previousHash !== expectedPrev) return false;
    const composite = `${entry.index}:${entry.previousHash}:${entry.timestamp}:${entry.data}`;
    const recomputed = await sha256(composite);
    if (recomputed !== entry.hash) return false;
  }
  return true;
}

export interface ECDSASignature {
  signature: string;
  publicKey: string;
  timestamp: number;
}

const ECDSA_KEY_PREFIX = 'sentra_ecdsa_';

export async function generateECDSAKeyPair(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );
  const pubBuf = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privBuf = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  return {
    publicKey: arrayBufferToBase64(pubBuf),
    privateKey: ECDSA_KEY_PREFIX + arrayBufferToBase64(privBuf),
  };
}

export async function ecdsaSign(
  message: string,
  privateKeyRaw: string
): Promise<ECDSASignature> {
  const privateKey = privateKeyRaw.replace(ECDSA_KEY_PREFIX, '');
  const key = await crypto.subtle.importKey(
    'pkcs8',
    base64ToArrayBuffer(privateKey),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(message)
  );
  return {
    signature: arrayBufferToBase64(sigBuf),
    publicKey: '',
    timestamp: Date.now(),
  };
}

export async function ecdsaVerify(
  message: string,
  signature: ECDSASignature,
  publicKeyRaw: string
): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      'spki',
      base64ToArrayBuffer(publicKeyRaw),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );
    return crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      base64ToArrayBuffer(signature.signature),
      new TextEncoder().encode(message)
    );
  } catch {
    return false;
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
