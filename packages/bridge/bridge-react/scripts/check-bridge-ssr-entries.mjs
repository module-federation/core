import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { PassThrough } from 'node:stream';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToPipeableStream } = require('react-dom/server');
const directory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const marker = '<template id="host-shell"></template>';

for (const mode of ['require', 'import']) {
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
  const request = createBridgeSSRController({
    request: new Request('https://host.test/inventory/detail/42'),
    shellEndMarker: marker,
    identifierPrefix: 'host-',
    timeoutMs: 1000,
  });
  let renders = 0;
  const factory = () => ({
    render() {},
    destroy() {},
    async renderStream(info) {
      renders++;
      assert.equal(info.basename, '/inventory');
      return {
        stream: new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode('<button>built SSR content</button>'),
            );
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
      async getRemoteModuleAndOptions() {
        return {
          remoteMatchInfo: {
            expose: './App',
            remoteSnapshot: {
              modules: [{ modulePath: './App', render: 'bridge' }],
            },
          },
        };
      },
      async loadRemote() {
        return { default: factory };
      },
    },
  };
  const Remote = createReactRemote({
    remote: 'shop/App',
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
  assert.match(html, /built SSR content/);
  assert.match(html, /"type":"done"/);
}

// Follow only actual output imports. Node-only SSR libraries must remain outside
// the browser consumer graph even though they are in the same published package.
for (const entry of [
  'base.es.js',
  'base.cjs.js',
  'index.es.js',
  'index.cjs.js',
]) {
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
