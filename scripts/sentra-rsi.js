/**
 * @fileoverview Sentra Core - Propuestas RSI en cuarentena.
 *
 * Este proceso analiza métricas locales y genera borradores aislados.
 * Nunca modifica código productivo ni aplica parches automáticamente.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG = Object.freeze({
  metricsPath: path.join(PROJECT_ROOT, 'logs', 'execution_metrics.json'),
  targetModule: path.join(PROJECT_ROOT, 'src', 'core', 'MoralNode.ts'),
  quarantineDir: path.join(PROJECT_ROOT, 'quarantine', 'rsi'),
});

function log(level, message, context = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    source: 'sentra-rsi',
    severity: level,
    message,
    ...context,
  };
  console.info(JSON.stringify(entry));
}

function loadExecutionMetrics() {
  if (!fs.existsSync(CONFIG.metricsPath)) return null;

  try {
    const rawData = fs.readFileSync(CONFIG.metricsPath, 'utf8').replace(/^\uFEFF/, '');
    const metrics = JSON.parse(rawData);
    if (!metrics || typeof metrics !== 'object' || Array.isArray(metrics)) {
      throw new TypeError('El archivo de métricas debe contener un objeto JSON.');
    }
    return metrics;
  } catch (error) {
    throw new Error(
      `No se pudieron cargar las métricas (${CONFIG.metricsPath}): ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function analyzeBottlenecks(metrics) {
  const proposals = [];
  const inferenceTime = metrics.averageInferenceTimeMs;
  if (typeof inferenceTime === 'number' && inferenceTime > 3) {
    proposals.push({
      target: 'PerceptionEngine',
      action: 'OPTIMIZE_EMA_FILTER',
      description: 'Evaluar una ventana EMA más corta para reducir latencia en edge.',
    });
  }

  if (Array.isArray(metrics.inefficientNodeBridges)) {
    for (const bridge of metrics.inefficientNodeBridges) {
      if (typeof bridge !== 'string' || bridge.trim().length === 0) continue;
      proposals.push({
        target: bridge,
        action: 'REVIEW_NODE_BRIDGE',
        description: 'Revisar el puente señalado por las métricas antes de proponer una mutación.',
      });
    }
  }
  return proposals;
}

function createQuarantinePatch(proposals, metrics) {
  const generatedAt = new Date().toISOString();
  const patchLines = [
    '# SENTRA RSI QUARANTINE PATCH',
    '# NON-APPLICABLE DRAFT: requiere veto humano explícito.',
    `# Generated: ${generatedAt}`,
    `# Target module: ${path.relative(PROJECT_ROOT, CONFIG.targetModule)}`,
    '# This file is intentionally descriptive and does not modify production code.',
    '',
    '## Metrics snapshot',
    '```json',
    JSON.stringify(metrics, null, 2),
    '```',
    '',
    '## Proposed changes',
    ...proposals.flatMap((proposal, index) => [
      `${index + 1}. [${proposal.action}] ${proposal.target}`,
      `   ${proposal.description}`,
      '   Approval required: HUMAN_VETO',
    ]),
    '',
    '## Approval gate',
    '- Status: PENDING_HUMAN_REVIEW',
    '- Apply automatically: FORBIDDEN',
    '- Required action: review, edit, and apply manually through the normal change workflow.',
    '',
  ];
  return patchLines.join('\n');
}

function writeQuarantinePatch(proposals, metrics) {
  fs.mkdirSync(CONFIG.quarantineDir, { recursive: true });
  const filename = `rsi-${new Date().toISOString().replace(/[:.]/g, '-')}.patch`;
  const patchPath = path.join(CONFIG.quarantineDir, filename);
  fs.writeFileSync(patchPath, createQuarantinePatch(proposals, metrics), 'utf8');
  return patchPath;
}

function executeRecursiveSelfImprovement() {
  log('INFO', 'Iniciando ciclo RSI en modo propuesta y cuarentena.');
  const metrics = loadExecutionMetrics();
  if (!metrics) {
    log('WARN', 'No se encontraron métricas recientes. Ciclo en espera.', {
      metricsPath: path.relative(PROJECT_ROOT, CONFIG.metricsPath),
    });
    return;
  }

  const proposals = analyzeBottlenecks(metrics);
  if (proposals.length === 0) {
    log('INFO', 'No se detectaron propuestas de mejora con las métricas actuales.');
    return;
  }

  const patchPath = writeQuarantinePatch(proposals, metrics);
  log('INFO', 'Propuestas generadas en cuarentena; no se modificó código productivo.', {
    proposalCount: proposals.length,
    patchPath: path.relative(PROJECT_ROOT, patchPath),
    humanVetoRequired: true,
  });
}

try {
  executeRecursiveSelfImprovement();
} catch (error) {
  log('ERROR', 'Fallo controlado en el ciclo RSI.', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
}
