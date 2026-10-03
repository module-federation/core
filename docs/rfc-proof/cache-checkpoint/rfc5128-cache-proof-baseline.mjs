// Re-run the proof using the exact baseline load.ts; restore fixed output in finally.
// TypeScript compilation adds .js to relative imports to match the ESM build layout.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const worktree = resolve(process.env.RFC5128_CACHE_WORKTREE || fileURLToPath(new URL('./rfc5128-cache/', import.meta.url)));
const ts = createRequire(resolve(worktree, 'package.json'))('typescript');
const baseline = spawnSync('git', ['show', '84cee419c5c7dc2bb87d1a92cd7fb8e15e409aec:packages/runtime-core/src/utils/load.ts'], { cwd: worktree, encoding: 'utf8' });
if (baseline.status !== 0) throw new Error(baseline.stderr);
const output = resolve(worktree, 'packages/runtime-core/dist/utils/load.js');
const fixed = readFileSync(output, 'utf8');
let emitted = ts.transpileModule(baseline.stdout, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
emitted = emitted.replace(/from '(\.\.?\/[^']+)'/g, (_, specifier) => `from '${specifier}.js'`);
try {
  writeFileSync(output, emitted);
  const proof = spawnSync(process.execPath, [fileURLToPath(new URL('./rfc5128-cache-proof.mjs', import.meta.url))], { encoding: 'utf8', env: { ...process.env, RFC5128_CACHE_WORKTREE: worktree } });
  process.stdout.write(proof.stdout); process.stderr.write(proof.stderr);
  process.exitCode = proof.status ?? 1;
} finally { writeFileSync(output, fixed); }
