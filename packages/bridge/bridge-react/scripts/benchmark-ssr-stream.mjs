import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { cpus, platform, arch } from 'node:os';
import { performance } from 'node:perf_hooks';
import { resolve } from 'node:path';
import { PassThrough } from 'node:stream';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Each sample starts a new Node process. Build first, then run this script with
// Node 20 on both revisions, with the same --runs and idle machine conditions.
const cases = [
  { name: 'small-1', instances: 1, size: 128, chunk: 65536 },
  { name: 'small-10', instances: 10, size: 128, chunk: 65536 },
  { name: 'small-100', instances: 100, size: 128, chunk: 65536 },
  { name: 'large-1', instances: 1, size: 128 * 1024, chunk: 65536 },
  { name: 'large-10', instances: 10, size: 128 * 1024, chunk: 65536 },
  { name: 'unicode-small-chunks', instances: 1, size: 32768, chunk: 7 },
  { name: 'slow-reader', instances: 10, size: 1024, chunk: 64, slow: true },
];
const probe = process.argv.indexOf('--probe');
const distArgument = process.argv.indexOf('--dist');
const dist =
  distArgument < 0
    ? new URL('../dist/', import.meta.url)
    : pathToFileURL(resolve(process.argv[distArgument + 1]) + '/');
const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
function resolveEntry(directory, explicit) {
  if (explicit) return pathToFileURL(resolve(explicit));
  const manifest = JSON.parse(
    readFileSync(new URL('../package.json', directory), 'utf8'),
  );
  const select = (value) => {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object') return undefined;
    for (const [condition, child] of Object.entries(value)) {
      if (['node', 'import', 'default'].includes(condition)) {
        const selected = select(child);
        if (selected) return selected;
      }
    }
  };
  const target = select(manifest.exports?.['./ssr-node']);
  assert.ok(
    target,
    'No Node import export for ./ssr-node; supply --entry for a standalone artifact',
  );
  return new URL(target, new URL('../', directory));
}
if (probe >= 0) {
  const fixture = cases.find((value) => value.name === process.argv[probe + 1]);
  assert.ok(fixture);
  const before = process.memoryUsage();
  const cpu = process.cpuUsage();
  const entry = resolveEntry(dist, argument('--entry'));
  const start = performance.now();
  const { createBridgeSSRController } = await import(entry);
  const imported = performance.now();
  const require = createRequire(import.meta.url);
  const React = require('react');
  const { renderToPipeableStream } = require('react-dom/server');
  const marker = '<template id="host-shell"></template>';
  const controller = createBridgeSSRController({
    request: new Request('https://host.test/inventory'),
    shellEndMarker: marker,
    identifierPrefix: 'host-',
    timeoutMs: 10000,
    onError(error) {
      throw error;
    },
  });
  const containers = [];
  const encoder = new TextEncoder();
  for (let i = 0; i < fixture.instances; i++) {
    const id = `remote-${i}`;
    containers.push(React.createElement('div', { id, key: id }));
    controller.context.register(
      id,
      () => ({
        render() {},
        destroy() {},
        renderStream(info) {
          const prefix = info.identifierPrefix;
          // A large complete fragment followed by a Fizz instruction and marker.
          // This intentionally measures stream preparation, not business loading.
          const text = '中🌿'.repeat(Math.ceil(fixture.size / 7));
          const html = encoder.encode(
            `<section>${text}<template id="${id}-shell"></template></section><script>$RC("${prefix}B:0","${prefix}S:0")</script>`,
          );
          let offset = 0;
          let update;
          let resolveSnapshot;
          const snapshot = new Promise((resolve) => {
            resolveSnapshot = resolve;
          });
          return {
            stream: new ReadableStream({
              pull(output) {
                if (offset < html.length) {
                  output.enqueue(
                    html.subarray(offset, (offset += fixture.chunk)),
                  );
                } else {
                  output.close();
                  // Data is deferred until after all HTML has been supplied.
                  resolveSnapshot({ pending: ['delivery'] });
                  update.enqueue({ id: 'delivery', value: '明天🌿' });
                  update.close();
                }
              },
            }),
            snapshot: Promise.resolve({ final: true }),
            hydration: {
              shellMarker: `${id}-shell`,
              snapshot,
              updates: new ReadableStream({
                start(value) {
                  update = value;
                },
              }),
            },
            abort() {},
          };
        },
      }),
      { props: {}, basename: '/inventory' },
    );
  }
  const input = new PassThrough();
  const output = controller.processStream(input);
  let firstHost;
  let firstRemote;
  let responseBytes = 0;
  let done = 0;
  let ready = 0;
  let updates = 0;
  const result = (async () => {
    for await (const chunk of output) {
      const text = chunk.toString();
      firstHost ??= performance.now();
      if (text.includes('"type":"html"')) firstRemote ??= performance.now();
      responseBytes += chunk.length;
      done += (text.match(/"type":"done"/g) || []).length;
      ready += (text.match(/"type":"ready"/g) || []).length;
      updates += (text.match(/"type":"update"/g) || []).length;
      if (fixture.slow) await new Promise((resolve) => setTimeout(resolve, 1));
    }
  })();
  const render = renderToPipeableStream(
    React.createElement(
      React.Fragment,
      null,
      ...containers,
      React.createElement('template', { id: 'host-shell' }),
    ),
    {
      onShellReady() {
        render.pipe(input);
      },
      onError(error) {
        input.destroy(error);
      },
    },
  );
  await result;
  const ended = performance.now();
  assert.equal(done, fixture.instances);
  assert.equal(ready, fixture.instances);
  assert.equal(updates, fixture.instances);
  assert.ok(firstRemote >= firstHost);
  const used = process.cpuUsage(cpu);
  const memory = process.memoryUsage();
  process.stdout.write(
    JSON.stringify({
      importMs: imported - start,
      firstHostMs: firstHost - imported,
      firstRemoteMs: firstRemote - imported,
      responseMs: ended - imported,
      importAndResponseMs: ended - start,
      cpuMs: (used.user + used.system) / 1000,
      heapDelta: memory.heapUsed - before.heapUsed,
      rssDelta: memory.rss - before.rss,
      maxRss: process.resourceUsage().maxRSS * 1024,
      responseBytes,
    }),
  );
} else {
  const runs = Number(argument('--runs', '15'));
  assert.ok(Number.isSafeInteger(runs) && runs > 0);
  const compare = argument('--compare-dist');
  const variants = compare
    ? { baseline: pathToFileURL(resolve(compare) + '/'), head: dist }
    : { head: dist };
  const entries = Object.fromEntries(
    Object.entries(variants).map(([name, directory]) => [
      name,
      resolveEntry(
        directory,
        argument(name === 'baseline' ? '--compare-entry' : '--entry'),
      ),
    ]),
  );
  const report = {
    node: process.version,
    platform: platform(),
    arch: arch(),
    cpu: cpus()[0]?.model,
    head: execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).trim(),
    runs,
    fixtures: cases,
    react: createRequire(import.meta.url)('react/package.json').version,
    lockfileSha256: createHash('sha256')
      .update(
        readFileSync(new URL('../../../../pnpm-lock.yaml', import.meta.url)),
      )
      .digest('hex'),
    notes:
      'Fresh process per sample; no warmup requests; production environment; OS file cache is not purged; spawn time excluded. Real React Host with generated remote HTML/Fizz fixtures and deferred data; no network/business loading or browser hydration. Memory includes import, fixture allocation and response. maxRss is process high-water RSS.',
    variants: {},
  };
  for (const [name, directory] of Object.entries(variants)) {
    const hash = createHash('sha256');
    for (const file of readdirSync(directory)
      .filter((file) => /\.(mjs|js)$/.test(file))
      .sort())
      hash.update(file).update(readFileSync(new URL(file, directory)));
    report.variants[name] = {
      dist: fileURLToPath(directory),
      entry: fileURLToPath(entries[name]),
      distSha256: hash.digest('hex'),
      cases: {},
    };
    for (const fixture of cases)
      report.variants[name].cases[fixture.name] = { raw: [] };
  }
  for (let i = 0; i < runs; i++)
    for (const fixture of cases)
      for (const name of i % 2
        ? Object.keys(variants).reverse()
        : Object.keys(variants)) {
        const sample = execFileSync(
          process.execPath,
          [
            fileURLToPath(import.meta.url),
            '--probe',
            fixture.name,
            '--dist',
            fileURLToPath(variants[name]),
            '--entry',
            fileURLToPath(entries[name]),
          ],
          {
            env: { ...process.env, NODE_ENV: 'production' },
            encoding: 'utf8',
            timeout: 30000,
          },
        );
        report.variants[name].cases[fixture.name].raw.push(JSON.parse(sample));
      }
  for (const variant of Object.values(report.variants))
    for (const result of Object.values(variant.cases)) {
      result.stats = {};
      for (const key of Object.keys(result.raw[0])) {
        const sorted = result.raw
          .map((sample) => sample[key])
          .sort((a, b) => a - b);
        result.stats[key] = {
          median: sorted[Math.floor(runs / 2)],
          p95: sorted[Math.ceil(runs * 0.95) - 1],
        };
      }
    }
  if (compare)
    for (const fixture of cases) {
      const baseline = report.variants.baseline.cases[fixture.name].raw;
      const head = report.variants.head.cases[fixture.name].raw;
      assert.ok(
        baseline.every(
          (sample, i) => sample.responseBytes === head[i].responseBytes,
        ),
        'Response bytes differ between revisions',
      );
    }
  const text = JSON.stringify(report, null, 2) + '\n';
  const destination = argument('--output');
  if (destination) writeFileSync(destination, text);
  else process.stdout.write(text);
}
