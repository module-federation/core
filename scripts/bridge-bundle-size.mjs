import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import { build, version as esbuildVersion } from 'esbuild';

// The head's fixtures and toolchain measure both revisions. Missing exports are
// unavailable capabilities, while declared exports with missing output are errors.
const fixtures = [
  {
    id: 'producer-v18',
    entry: './v18',
    api: 'createBridgeComponent',
    target: 'browser',
  },
  {
    id: 'producer-v19',
    entry: './v19',
    api: 'createBridgeComponent',
    target: 'browser',
  },
  {
    id: 'producer-server',
    entry: './server',
    api: 'createBridgeComponent',
    target: 'node',
  },
  {
    id: 'host-controller',
    entry: './ssr-node',
    api: 'createBridgeSSRController',
    target: 'node',
  },
];

function exportTarget(value, conditions) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return undefined;
  for (const [key, child] of Object.entries(value)) {
    if (conditions.has(key) || key === 'default') {
      const selected = exportTarget(child, conditions);
      if (selected) return selected;
    }
  }
}

function entryFile(directory, manifest, entry, target) {
  if (!Object.hasOwn(manifest.exports || {}, entry)) return undefined;
  const selected = exportTarget(
    manifest.exports[entry],
    new Set(['import', target]),
  );
  assert(selected, `No ${target} import target for ${entry}`);
  const file = resolve(directory, selected);
  assert(existsSync(file), `Build the declared Bridge export first: ${file}`);
  return file;
}

function sizes(value) {
  return {
    bytes: value.byteLength,
    gzipBytes: gzipSync(value, { level: 9 }).byteLength,
  };
}

export async function measureBridge(packagesDirectory) {
  const root = resolve(packagesDirectory, '..');
  const directory = resolve(packagesDirectory, 'bridge/bridge-react');
  const manifestPath = join(directory, 'package.json');
  const manifest = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, 'utf8'))
    : {};
  const lock = readFileSync(join(root, 'pnpm-lock.yaml'));
  const git = (...args) =>
    execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();
  const peers = Object.keys(manifest.peerDependencies || {}).sort();
  const report = {
    revision: git('rev-parse', 'HEAD'),
    dirty: Boolean(git('status', '--porcelain', '--untracked-files=no')),
    lockfileSha256: createHash('sha256').update(lock).digest('hex'),
    node: process.version,
    esbuild: esbuildVersion,
    config: {
      format: 'esm',
      target: 'es2021',
      nodeEnv: 'production',
      externalPolicy: 'declared peer dependencies and Node builtins',
      gzipLevel: 9,
    },
    peers,
    fixtures: {},
  };

  for (const fixture of fixtures) {
    const file = entryFile(directory, manifest, fixture.entry, fixture.target);
    if (!file) {
      report.fixtures[fixture.id] = {
        ...fixture,
        status: 'unavailable',
        reason: 'Export absent at this revision',
      };
      continue;
    }
    const options = {
      absWorkingDir: directory,
      stdin: {
        resolveDir: directory,
        sourcefile: 'bridge-size-fixture.mjs',
        contents: `export { ${fixture.api} } from ${JSON.stringify(file)}`,
      },
      bundle: true,
      treeShaking: true,
      write: false,
      metafile: true,
      format: report.config.format,
      target: report.config.target,
      platform: fixture.target,
      define: { 'process.env.NODE_ENV': JSON.stringify(report.config.nodeEnv) },
      external: peers.flatMap((name) => [name, `${name}/*`]),
    };
    const raw = await build({ ...options, minify: false });
    const minified = await build({ ...options, minify: true });
    report.fixtures[fixture.id] = {
      ...fixture,
      status: 'available',
      resolvedEntry: relative(directory, file).replaceAll('\\', '/'),
      rawBytes: raw.outputFiles[0].contents.byteLength,
      minifiedBytes: minified.outputFiles[0].contents.byteLength,
      gzipBytes: sizes(minified.outputFiles[0].contents).gzipBytes,
      inputs: Object.fromEntries(
        Object.entries(minified.metafile.inputs).map(([name, value]) => [
          name.replaceAll('\\', '/'),
          value.bytes,
        ]),
      ),
      externalImports: [
        ...new Set(
          Object.values(minified.metafile.outputs).flatMap((output) =>
            output.imports
              .filter((item) => item.external)
              .map((item) => item.path),
          ),
        ),
      ].sort(),
    };
  }

  // This is per-response HTML, not a JavaScript bundle or a comparable CSR cost.
  const controllerEntry = entryFile(directory, manifest, './ssr-node', 'node');
  if (controllerEntry) {
    const { createBridgeSSRController } = await import(
      pathToFileURL(controllerEntry).href
    );
    const controller = createBridgeSSRController({
      request: new Request('https://host.test/'),
      shellEndMarker: '<template id="host-shell"></template>',
      identifierPrefix: 'host-',
    });
    try {
      const html = sizes(Buffer.from(controller.getBootstrap()));
      report.fixtures['receiver-html'] = {
        id: 'receiver-html',
        target: 'response HTML',
        status: 'available',
        rawBytes: html.bytes,
        gzipBytes: html.gzipBytes,
        options: { timeoutMs: 30000, nonce: null, stylesheets: [] },
      };
    } finally {
      controller.abort();
    }
  } else {
    report.fixtures['receiver-html'] = {
      id: 'receiver-html',
      target: 'response HTML',
      status: 'unavailable',
      reason: 'SSR controller absent at this revision',
    };
  }
  return report;
}

export function compareBridge(base, current) {
  if (!base && !current) return '';
  if (base && current) {
    assert.deepEqual(
      base.config,
      current.config,
      'Bridge measurement settings differ',
    );
    assert.equal(
      base.node,
      current.node,
      'Bridge measurement Node versions differ',
    );
    assert.equal(
      base.esbuild,
      current.esbuild,
      'Bridge measurement esbuild versions differ',
    );
  }
  const bytes = (value) =>
    typeof value === 'number' ? `${value.toLocaleString('en-US')} B` : '—';
  const delta = (before, after) =>
    typeof before === 'number' && typeof after === 'number'
      ? `${after >= before ? '+' : ''}${(after - before).toLocaleString('en-US')} B`
      : '—';
  const lines = [
    '### Bridge fixtures',
    '',
    `Base: \`${base?.revision || 'not measured'}\` · Head: \`${current?.revision || 'not measured'}\``,
    '',
    `Toolchain: Node \`${current?.node || base?.node}\`, esbuild \`${current?.esbuild || base?.esbuild}\`.`,
    '',
    '| Fixture | Target | Base minified | Head minified | Delta | Base gzip | Head gzip | Delta | Status |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ];
  const names = new Set([
    ...Object.keys(base?.fixtures || {}),
    ...Object.keys(current?.fixtures || {}),
  ]);
  for (const name of names) {
    const before = base?.fixtures[name];
    const after = current?.fixtures[name];
    const status =
      !before || !after
        ? 'Not measured'
        : before.status === 'unavailable' && after.status === 'available'
          ? 'New capability'
          : before.status === 'available' && after.status === 'unavailable'
            ? 'Removed'
            : after.status === 'available'
              ? 'Comparable'
              : 'Unavailable';
    lines.push(
      `| ${name} | ${after?.target || before?.target} | ${bytes(before?.minifiedBytes)} | ${bytes(after?.minifiedBytes)} | ${delta(before?.minifiedBytes, after?.minifiedBytes)} | ${bytes(before?.gzipBytes)} | ${bytes(after?.gzipBytes)} | ${delta(before?.gzipBytes, after?.gzipBytes)} | ${status} |`,
    );
  }
  lines.push(
    '',
    'Non-peer runtime dependencies are bundled. Declared peer dependencies and Node builtins are external. Raw bytes, resolved inputs, external imports, lockfile hashes and tool versions are retained in the JSON reports. Receiver HTML has raw/gzip metrics only and is an unminified per-response payload with no nonce or stylesheets. Fixtures are measured independently and their sizes are not additive. New capabilities have no baseline delta. These are size measurements, not execution-time benchmarks.',
    '',
  );
  if (base?.dirty || current?.dirty)
    lines.push('Local measurement includes uncommitted tracked changes.', '');
  return lines.join('\n');
}
