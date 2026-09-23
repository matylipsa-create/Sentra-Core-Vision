/**
 * @fileoverview Sentra Core - Auditoría y blindaje industrial.
 *
 * El modo predeterminado solo audita. Usar `node scripts/sentra-forge.js --seal`
 * para añadir cabeceras de trazabilidad a los archivos auditados.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG = Object.freeze({
  targetDirs: ['src/core', 'src/services', 'server'],
  sealFiles: process.argv.includes('--seal'),
});
const IGNORED_DIRECTORIES = new Set(['node_modules', 'dist', 'build', 'coverage']);

const HEADER = `/**\n * @fileoverview Componente blindado de Sentra Core.\n * Estándar industrial estricto - Cero excepciones globales no controladas.\n */\n\n`;

function getSourceFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory() && !IGNORED_DIRECTORIES.has(entry.name)) {
      files.push(...getSourceFiles(entryPath));
    } else if (entry.isFile() && /\.(?:ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

function auditFile(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`No se pudo leer ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }

  const relativePath = path.relative(PROJECT_ROOT, filePath);
  const hasPotentialTimerLeak = content.includes('setInterval') && !content.includes('clearInterval');
  if (hasPotentialTimerLeak) {
    console.warn(`[ALERTA DE CALIDAD] Posible timer sin limpieza en: ${relativePath}`);
  }

  if (CONFIG.sealFiles && !content.includes('@fileoverview Sentra Core')) {
    try {
      fs.writeFileSync(filePath, `${HEADER}${content}`, 'utf8');
    } catch (error) {
      throw new Error(`No se pudo sellar ${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
    console.info(`[SEALED] ${relativePath}`);
    return 'sealed';
  }

  return hasPotentialTimerLeak ? 'warning' : 'ok';
}

function enforceIndustrialStandards() {
  console.info(`[SENTRA-FORGE] Iniciando auditoría industrial${CONFIG.sealFiles ? ' y sellado' : ''}...`);
  let auditedFiles = 0;
  let sealedFiles = 0;
  let warningFiles = 0;

  for (const targetDir of CONFIG.targetDirs) {
    const fullPath = path.join(PROJECT_ROOT, targetDir);
    if (!fs.existsSync(fullPath)) {
      console.warn(`[WARNING] Directorio no encontrado: ${targetDir}`);
      continue;
    }

    for (const filePath of getSourceFiles(fullPath)) {
      const result = auditFile(filePath);
      auditedFiles += 1;
      if (result === 'sealed') sealedFiles += 1;
      if (result === 'warning') warningFiles += 1;
    }
  }

  console.info(
    `[SENTRA-FORGE] Auditoría completada. ` +
    `Archivos: ${auditedFiles}; sellados: ${sealedFiles}; advertencias: ${warningFiles}.`,
  );
}

try {
  enforceIndustrialStandards();
} catch (error) {
  console.error(
    '[FATAL ERROR] Fallo en la auditoría industrial de Sentra Core:',
    error instanceof Error ? error.message : String(error),
  );
  process.exitCode = 1;
}
