import { storageService } from './StorageService';

export type AuditFormat = 'json' | 'csv';

function escapeCsv(value: unknown): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export async function downloadAuditReport(format: AuditFormat): Promise<number> {
  const entries = await storageService.getAllEvidence();
  const perceptionEntries = entries.filter(({ module, action }) => (
    /vision|perception|master/i.test(module) || /detection|ocr|perception/i.test(action)
  ));
  const report = {
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    recordCount: entries.length,
    perceptionEventCount: perceptionEntries.length,
    records: entries,
    perceptionEvents: perceptionEntries,
  };

  const content = format === 'json'
    ? JSON.stringify(report, null, 2)
    : [
      ['id', 'timestamp', 'module', 'action', 'index', 'hash', 'previousHash', 'signature', 'publicKey', 'data'],
      ...entries.map((record) => [
        record.id,
        new Date(record.entry.timestamp).toISOString(),
        record.module,
        record.action,
        record.entry.index,
        record.entry.hash,
        record.entry.previousHash,
        record.signature.signature,
        record.signature.publicKey,
        record.entry.data,
      ]),
    ].map((row) => row.map(escapeCsv).join(',')).join('\r\n');

  const blob = new Blob([content], {
    type: format === 'json' ? 'application/json;charset=utf-8' : 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `sentra-evolis-audit-${Date.now()}.${format}`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return entries.length;
}
