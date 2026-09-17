import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const JavaScriptObfuscator = require('javascript-obfuscator');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist', 'assets');

function obfuscateFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const obfuscated = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.5,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false,
  }).getObfuscatedCode();

  fs.writeFileSync(filePath, obfuscated, 'utf8');
  console.log(`[Obfuscate] ${path.basename(filePath)}`);
}

function obfuscateDir(dir) {
  if (!fs.existsSync(dir)) {
    console.log('[Obfuscate] dist/assets no existe. Corre npm run build primero.');
    return;
  }
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    if (file.endsWith('.js')) {
      obfuscateFile(path.join(dir, file));
    }
  });
}

obfuscateDir(distDir);
console.log('[Obfuscate] Build ofuscado.');