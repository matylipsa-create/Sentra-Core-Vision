/**
 * @fileoverview Verificador de integridad para cadenas de auditoría EVOLIS.
 */

import { sha256 } from '../lib/crypto';
import type { AuditRecord } from './SecureStateRegistry';

export interface ChainVerificationResult {
  readonly isValid: boolean;
  readonly brokenAtIndex: number | null;
  readonly errorMessage: string | null;
}

const GENESIS_HASH = '0'.repeat(64);

export class EvolisChainVerifier {
  static async verifyChain(
    records: ReadonlyArray<AuditRecord>,
  ): Promise<ChainVerificationResult> {
    let expectedPreviousHash = GENESIS_HASH;

    for (let index = 0; index < records.length; index += 1) {
      const record = records[index];
      if (record.previousHash !== expectedPreviousHash) {
        return {
          isValid: false,
          brokenAtIndex: index,
          errorMessage: `Ruptura de enlace en el índice ${index}: previousHash no coincide con el hash previo.`,
        };
      }

      const rawData = `${record.previousHash}:${record.timestamp}:${record.module}:${JSON.stringify(record.statePayload)}`;
      const calculatedSignature = await sha256(rawData);
      if (calculatedSignature !== record.signature) {
        return {
          isValid: false,
          brokenAtIndex: index,
          errorMessage: `Manipulación detectada en el índice ${index}: la firma no coincide con el payload.`,
        };
      }
      expectedPreviousHash = record.signature;
    }

    return { isValid: true, brokenAtIndex: null, errorMessage: null };
  }
}
