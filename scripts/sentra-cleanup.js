/**
 * @fileoverview Migración segura de stubs obsoletos a legacy/.
 *
 * La migración se detiene si encuentra imports activos. No usa --force:
 * mover un módulo referenciado rompería el build y ocultaría deuda técnica.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TARGET_RELATIVE = path.join('src', 'core', 'TCREIBridge.ts');
const TARGET_FILE = path.join(PROJECT_ROOT, TARGET_RELATIVE);
const LEGACY_DIR = path.join(PROJECT_ROOT, 'legacy');
const DESTINATION_FILE = path.join(LEGACY_DIR, 'TCREIBridge.ts');
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const IGNORED_DIRECTORIES = new Set(['node_modules', 'dist', 'build', 'coverage', '.git']);

function collectSourceFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (IGNORED_DIRECTORIES.has(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(entryPath));
    } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }
  return files;
}

function findActiveReferences() {
  const targetStem = 'TCREIBridge';
  return collectSourceFiles(PROJECT_ROOT)
    .filter((filePath) => (
      path.resolve(filePath) !== path.resolve(TARGET_FILE)
      && path.resolve(filePath) !== path.resolve(fileURLToPath(import.meta.url))
    ))
    .flatMap((filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      const hasImport = new RegExp(`(?:from|import\\s*\\()\\s*['"][^'"]*${targetStem}`, 'm').test(content);
      if (!hasImport) return [];
      return [path.relative(PROJECT_ROOT, filePath)];
    });
}

function executeCleanup() {
  console.info('[Cleanup] Iniciando auditoría de código muerto...');

  if (!fs.existsSync(TARGET_FILE)) {
    console.info('[Cleanup] TCREIBridge.ts no se encuentra en src/core/. Omitido.');
    return;
  }

  if (fs.existsSync(DESTINATION_FILE)) {
    throw new Error('El destino legacy/TCREIBridge.ts ya existe; no se sobrescribirá.');
  }

  const references = findActiveReferences();
  if (references.length > 0) {
    console.warn('[Cleanup] Migración bloqueada: existen referencias activas a TCREIBridge.');
    for (const reference of references) {
      console.warn(`  - ${reference}`);
    }
    console.warn('[Cleanup] No se modificó ningún archivo. Migre los consumidores antes de reintentar.');
    return;
  }

  fs.mkdirSync(LEGACY_DIR, { recursive: true });
  fs.renameSync(TARGET_FILE, DESTINATION_FILE);
  console.info('[Cleanup] TCREIBridge.ts movido a legacy/ de forma segura.');
}

try {
  executeCleanup();
} catch (error) {
  console.error(
    '[Cleanup] Error durante la migración:',
    error instanceof Error ? error.message : String(error),
  );
  process.exitCode = 1;
}
