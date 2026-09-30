import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { EVOLISEvidence } from '../src/core/EVOLIS.js';

export class EvidenceJournal {
  private readonly filePath = process.env.SENTRA_EVIDENCE_PATH
    ? resolve(process.env.SENTRA_EVIDENCE_PATH)
    : fileURLToPath(new URL('./data/evolis-audit.jsonl', import.meta.url));
  private readonly keyPath = process.env.SENTRA_EVIDENCE_KEY_PATH
    ? resolve(process.env.SENTRA_EVIDENCE_KEY_PATH)
    : `${this.filePath}.key.json`;
  private writeTail: Promise<void> = Promise.resolve();

  async load(): Promise<EVOLISEvidence[]> {
    try {
      const contents = await readFile(this.filePath, 'utf8');
      return contents.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as EVOLISEvidence);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return [];
      throw error;
    }
  }

  async append(evidence: EVOLISEvidence): Promise<void> {
    const write = this.writeTail.then(async () => {
      await mkdir(dirname(this.filePath), { recursive: true });
      await appendFile(this.filePath, `${JSON.stringify(evidence)}\n`, 'utf8');
    });
    this.writeTail = write.then(() => undefined, () => undefined);
    await write;
  }

  async loadKeyPair(): Promise<{ publicKey: string; privateKey: string } | undefined> {
    try {
      return JSON.parse(await readFile(this.keyPath, 'utf8')) as { publicKey: string; privateKey: string };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return undefined;
      throw error;
    }
  }

  async saveKeyPair(keyPair: { publicKey: string; privateKey: string }): Promise<void> {
    await mkdir(dirname(this.keyPath), { recursive: true });
    await writeFile(this.keyPath, JSON.stringify(keyPair), { encoding: 'utf8', mode: 0o600 });
  }
}
