import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { PassThrough } from 'node:stream';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToPipeableStream } = require('react-dom/server');
const directory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const marker = '<template id="host-shell"></template>';

// Test each native loader in its own process, without another format warming
// imports or hiding a declaration/runtime format mismatch.
const modes = process.argv[2] === '--native-probe' ? [process.argv[3]] : [];
if (!modes.length) {
  for (const mode of ['require', 'import']) {
    const result = spawnSync(
      process.execPath,
      [fileURLToPath(import.meta.url), '--native-probe', mode],
      {
        encoding: 'utf8',
        timeout: 15000,
      },
    );
    if (result.stderr) process.stderr.write(result.stderr);
    assert.equal(
      result.status,
      0,
      result.error?.message || result.stdout || result.stderr,
    );
    assert(
      !result.stderr.includes('MODULE_TYPELESS_PACKAGE_JSON'),
      `${mode} reparsed its native entry`,
    );
  }
}
for (const mode of modes) {
  const load = (name) => (mode === 'require' ? require(name) : import(name));
  const { createReactRemote } = await load(
    '@module-federation/bridge-react/base',
  );
  const { BridgeSSRContext } = await load(
    '@module-federation/bridge-react/ssr',
  );
  const { createBridgeSSRController } = await load(
    '@module-federation/bridge-react/ssr-node',
  );
  const { createBridgeComponent } = await load(
    '@module-federation/bridge-react/server',
  );
  const legacyBase = await load(
    `@module-federation/bridge-react/dist/base.node.${mode === 'import' ? 'es' : 'cjs'}.js`,
  );
  const legacyServer = await load(
    `@module-federation/bridge-react/dist/server.${mode === 'import' ? 'es' : 'cjs'}.js`,
  );
  assert.strictEqual(legacyBase.createReactRemote, createReactRemote);
  assert.strictEqual(legacyServer.createBridgeComponent, createBridgeComponent);
  const request = createBridgeSSRController({
    request: new Request('https://host.test/inventory/detail/42'),
    shellEndMarker: marker,
    identifierPrefix: 'host-',
    timeoutMs: 1000,
  });
  let renders = 0;
  const factory = createBridgeComponent({
    rootComponent: () => null,
    async renderStream(_app, info) {
      renders++;
      assert.equal(info.basename, '/inventory');
      const html = `<button>built SSR content 世界 &amp; 🌿</button><script nonce="test">function $RC(a,b){document.getElementById(a)};$RC("${info.identifierPrefix}B:0","${info.identifierPrefix}S:0")</script>`;
      return {
        stream: new ReadableStream({
          start(controller) {
            // Exercise the bundled public Parser and decoder at byte boundaries.
            for (const byte of Buffer.from(html))
              controller.enqueue(Uint8Array.of(byte));
            controller.close();
          },
        }),
        snapshot: Promise.resolve({ loaderData: 'restored' }),
        abort() {},
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
  const output = request.processStream(input);
  const result = (async () => {
    let html = '';
    for await (const chunk of output) html += chunk.toString();
    return html;
  })();
  const errors = [];
  const host = renderToPipeableStream(
    React.createElement(
      BridgeSSRContext.Provider,
      { value: request.context },
      React.createElement(Remote),
      React.createElement('template', { id: 'host-shell' }),
    ),
    {
      identifierPrefix: 'host-',
      onShellReady() {
        host.pipe(input);
      },
      onError(error) {
        errors.push(error);
      },
    },
  );
  const html = await result;
  assert.deepEqual(errors, []);
  assert.equal(renders, 1, `${mode} entry did not share the SSR context`);
  assert.match(html, /built SSR content 世界 &amp; 🌿/);
  assert.match(html, /data-mf-react-transport/);
  assert.match(html, /function \$MF_[0-9a-f]+_RC/);
  assert(
    !html.includes('function $RC('),
    'Producer completion helper was not isolated',
  );
  assert.match(html, /"type":"done"/);
}

// Follow only actual output imports. Node-only SSR libraries must remain outside
// the browser consumer graph even though they are in the same published package.
for (const entry of ['base.mjs', 'base.cjs', 'index.mjs', 'index.cjs']) {
  const seen = new Set();
  const visit = async (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    const source = await readFile(file, 'utf8');
    const imports = source.matchAll(
      /(?:from\s*|import\s*|require\()\s*["']([^"']+)["']/g,
    );
    for (const [, name] of imports) {
      assert.ok(
        !/^(node:|acorn$|htmlparser2$)/.test(name),
        `${entry} imports ${name}`,
      );
      if (name.startsWith('.')) await visit(resolve(dirname(file), name));
    }
  };
  await visit(resolve(directory, 'dist', entry));
}
console.log(
  'Bridge SSR ESM/CJS entries share their context and keep Node dependencies outside browser entries.',
);
