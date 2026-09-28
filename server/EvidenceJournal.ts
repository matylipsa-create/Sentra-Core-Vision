import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { EVOLISEvidence } from '../src/core/EVOLIS.js';

export class EvidenceJournal {
  private readonly filePath = process.env.SENTRA_EVIDENCE_PATH
    ? resolve(process.env.SENTRA_EVIDENCE_PATH)
    : fileURLToPath(new URL('./data/evolis-audit.jsonl', import.meta.url));
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
}
