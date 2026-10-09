// Loads the project's own TypeScript modules into plain Node, for the regression
// tests in scripts/. It transpiles .ts files on the fly with the TypeScript
// compiler that is already a dev dependency and teaches CommonJS the '@/' alias,
// so a test exercises the real code, not a copy of it. No build step, no new
// dependency.
//
//   import { loadTs, root } from './lib/load-ts.mjs';
//   const { esc } = loadTs('lib/escape.ts');
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Module from 'node:module';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(import.meta.url);
const ts = require('typescript');

require.extensions['.ts'] = Module._extensions['.ts'] = (mod, filename) => {
  const out = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  mod._compile(out, filename);
};

const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith('@/')) request = join(root, request.slice(2));
  if (/^[/\\]|^[A-Za-z]:/.test(request) && !/\.[a-z]+$/.test(request)) {
    try { return origResolve.call(this, `${request}.ts`, ...rest); } catch { /* fall through */ }
  }
  return origResolve.call(this, request, ...rest);
};

/** Load a project module by repo-relative path, e.g. loadTs('lib/density.ts'). */
export function loadTs(relPath) {
  return require(join(root, relPath));
}
