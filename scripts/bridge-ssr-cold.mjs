// Each sample starts a fresh Node process and renders its first streaming SSR
// response. No application cache is warmed. Run the same script/toolchain for
// both revisions; this fixture measures local rendering, not network loading.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { PassThrough, Readable } from 'node:stream';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
if (args[0] !== '--probe') {
  const option = (key, fallback) => {
    const index = args.indexOf(key);
    return index < 0 ? fallback : args[index + 1];
  };
  const directory = resolve(
    option('--package-dir', 'packages/bridge/bridge-react'),
  );
  const count = Number(option('--samples', '15'));
  assert(
    Number.isInteger(count) && count > 0,
    'samples must be a positive integer',
  );
  const executable = option('--node', process.execPath);
  const git = (...args) =>
    spawnSync('git', ['-C', directory, ...args], {
      encoding: 'utf8',
    }).stdout.trim();
  const repository = git('rev-parse', '--show-toplevel');
  const report = {
    directory,
    revision: option('--revision', git('rev-parse', 'HEAD')),
    dirty: Boolean(git('status', '--porcelain', '--untracked-files=no')),
    lockfileSha256: createHash('sha256')
      .update(readFileSync(resolve(repository, 'pnpm-lock.yaml')))
      .digest('hex'),
    scriptSha256: createHash('sha256')
      .update(readFileSync(import.meta.filename))
      .digest('hex'),
    samples: count,
    node: undefined,
    modes: {},
  };
  for (const mode of ['import', 'require']) {
    const samples = [];
    for (let i = 0; i < count; i++) {
      const result = spawnSync(
        executable,
        [import.meta.filename, '--probe', directory, mode],
        {
          encoding: 'utf8',
          env: { ...process.env, NODE_ENV: 'production' },
          timeout: 15000,
        },
      );
      if (result.status !== 0)
        throw new Error(
          result.error?.message || result.stderr || result.stdout,
        );
      // Preserve all native-loader diagnostics, including baseline warnings.
      if (result.stderr) process.stderr.write(result.stderr);
      samples.push(JSON.parse(result.stdout));
    }
    report.node = samples[0].node;
    const summary = {};
    for (const key of [
      'importMs',
      'firstChunkMs',
      'requestMs',
      'importAndRequestMs',
      'cpuMs',
      'heapDelta',
      'rssDelta',
    ]) {
      const sorted = samples.map((sample) => sample[key]).sort((a, b) => a - b);
      summary[key] = {
        p50: sorted[Math.floor(count * 0.5)],
        p95: sorted[Math.min(count - 1, Math.floor(count * 0.95))],
      };
    }
    report.modes[mode] = { summary, samples };
  }
  const json = `${JSON.stringify(report, null, 2)}\n`;
  const output = option('--output');
  if (output) writeFileSync(output, json);
  else process.stdout.write(json);
} else {
  const [, directory, mode] = args;
  const require = createRequire(resolve(directory, 'package.json'));
  const manifest = JSON.parse(
    readFileSync(resolve(directory, 'package.json'), 'utf8'),
  );
  const load = (entry) => {
    let value = manifest.exports[entry];
    if (value.node) value = value.node;
    value = value[mode];
    if (typeof value === 'object') value = value.default;
    const file = resolve(directory, value);
    return mode === 'import' ? import(pathToFileURL(file).href) : require(file);
  };
  const before = process.memoryUsage();
  const cpu = process.cpuUsage();
  const start = performance.now();
  const [
    { createReactRemote },
    { BridgeSSRContext },
    { createBridgeSSRController },
    { createBridgeComponent },
  ] = await Promise.all([
    load('./base'),
    load('./ssr'),
    load('./ssr-node'),
    load('./server'),
  ]);
  const React = require('react');
  const { renderToPipeableStream } = require('react-dom/server');
  const importedAt = performance.now();
  const errors = [];
  let producerPrefix;
  const controller = createBridgeSSRController({
    request: new Request('https://host.test/inventory'),
    shellEndMarker: '<template id="host-shell"></template>',
    identifierPrefix: 'host-',
    timeoutMs: 1000,
    onError(error) {
      errors.push(error.message);
    },
  });
  let renders = 0;
  let ready = false;
  let pending;
  function Content() {
    const id = React.useId();
    if (!ready) {
      pending ??= new Promise((resolve) =>
        setImmediate(() => {
          ready = true;
          resolve();
        }),
      );
      throw pending;
    }
    return React.createElement(
      'button',
      { id },
      'actual producer content 世界',
    );
  }
  const factory = createBridgeComponent({
    rootComponent: () =>
      React.createElement(
        React.Suspense,
        { fallback: 'pending' },
        React.createElement(Content),
      ),
    renderStream(app, info) {
      renders++;
      producerPrefix = info.identifierPrefix;
      const stream = new PassThrough();
      const render = renderToPipeableStream(app, {
        identifierPrefix: info.identifierPrefix,
        onShellReady() {
          render.pipe(stream);
        },
        onError(error) {
          stream.destroy(error);
        },
      });
      return {
        stream: Readable.toWeb(stream),
        snapshot: Promise.resolve({ loaderData: 'restored' }),
        abort(reason) {
          render.abort(reason);
        },
      };
    },
  });
  const instance = {
    registerPlugins() {},
    remoteHandler: {
      idToRemoteMap: {},
      getLoadedRemoteInfo(value) {
        if (value !== factory) return;
        return {
          id: 'shop/App',
          isModule: false,
          recovered: false,
          remoteMatchInfo: {
            expose: './App',
            remoteSnapshot: {
              modules: [{ modulePath: './App', render: 'bridge' }],
            },
          },
        };
      },
    },
  };
  const Remote = createReactRemote({
    remote: () => factory,
    instance,
    basename: '/inventory',
  });
  const input = new PassThrough();
  const output = controller.processStream(input);
  let firstChunkAt;
  const result = (async () => {
    let html = '';
    for await (const chunk of output) {
      firstChunkAt ??= performance.now();
      html += chunk.toString();
    }
    return html;
  })();
  const render = renderToPipeableStream(
    React.createElement(
      BridgeSSRContext.Provider,
      { value: controller.context },
      React.createElement(Remote),
      React.createElement('template', { id: 'host-shell' }),
    ),
    {
      identifierPrefix: 'host-',
      onShellReady() {
        render.pipe(input);
      },
      onError(error) {
        errors.push(error.message);
      },
    },
  );
  const html = await result;
  const endedAt = performance.now();
  assert.deepEqual(errors, []);
  assert.equal(renders, 1);
  assert.match(html, /actual producer content 世界/);
  assert(
    html.includes(`$MF_${Buffer.from(producerPrefix).toString('hex')}_RC`),
    'Producer Fizz completion helpers must pass through namespace isolation',
  );
  assert.match(html, /"type":"done"/);
  assert.match(
    html,
    /pending/,
    'Suspense must flush its fallback before the completed content',
  );
  const used = process.cpuUsage(cpu);
  process.stdout.write(
    JSON.stringify({
      node: process.version,
      react: React.version,
      importMs: importedAt - start,
      firstChunkMs: firstChunkAt - importedAt,
      requestMs: endedAt - importedAt,
      importAndRequestMs: endedAt - start,
      cpuMs: (used.user + used.system) / 1000,
      heapDelta: process.memoryUsage().heapUsed - before.heapUsed,
      rssDelta: process.memoryUsage().rss - before.rss,
      responseBytes: Buffer.byteLength(html),
    }),
  );
}
