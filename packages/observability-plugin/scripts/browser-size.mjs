import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const browserEntry = resolve(packageRoot, 'dist/esm/browser.js');
const outputRoot = mkdtempSync(join(tmpdir(), 'mf-observability-browser-'));
const sourceEntry = join(outputRoot, 'entry.mjs');
const budget = 24_000;

writeFileSync(
  sourceEntry,
  `export { default } from ${JSON.stringify(browserEntry)};\n`,
);

function bundle(outputName, minify) {
  const outputDirectory = join(outputRoot, outputName);
  const args = [
    'exec',
    'esbuild',
    sourceEntry,
    '--bundle',
    '--splitting',
    '--platform=browser',
    '--format=esm',
    '--external:@module-federation/runtime',
    '--entry-names=browser',
    '--chunk-names=chunks/[name]-[hash]',
    `--outdir=${outputDirectory}`,
  ];
  if (minify) {
    args.push('--minify');
  }

  execFileSync('pnpm', args, {
    cwd: packageRoot,
    stdio: 'inherit',
  });

  return {
    outputDirectory,
    entryBytes: readFileSync(join(outputDirectory, 'browser.js')).length,
  };
}

const unminified = bundle('unminified', false);
const minified = bundle('minified', true);
const minifiedEntry = readFileSync(
  join(minified.outputDirectory, 'browser.js'),
);
const gzipBytes = gzipSync(minifiedEntry, { level: 9 }).length;
const optionalChunkBytes = readdirSync(
  join(minified.outputDirectory, 'chunks'),
).reduce(
  (total, file) =>
    total + readFileSync(join(minified.outputDirectory, 'chunks', file)).length,
  0,
);

console.log(
  JSON.stringify({
    unminifiedBytes: unminified.entryBytes,
    minifiedBytes: minified.entryBytes,
    gzipBytes,
    optionalChunkBytes,
    gzipBudget: budget,
  }),
);

if (gzipBytes > budget) {
  throw new Error(
    `browser entry gzip size ${gzipBytes} exceeds budget ${budget} bytes`,
  );
}
