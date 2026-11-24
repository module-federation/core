// Optional runtime matrix: install matching react/react-dom and jsdom in a
// disposable fixture, then pass its directory. No workspace peer is rewritten.
// pnpm --filter @module-federation/bridge-react exec node scripts/check-react-runtime-contract.mjs /path/to/fixture
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { PassThrough, Readable } from 'node:stream';
import { build } from 'esbuild';

const directory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { exports: packageExports } = JSON.parse(
  await readFile(resolve(directory, 'package.json'), 'utf8'),
);
// Follow conditional-export key order, enabling only this runtime and import.
// The browser path deliberately excludes node even though the harness is Node.
function runtimeEntry(subpath, runtime) {
  const conditions = new Set([runtime, 'import']);
  const select = (entry) => {
    if (typeof entry === 'string') return entry;
    if (!entry || typeof entry !== 'object') return;
    for (const [condition, target] of Object.entries(entry)) {
      if (condition === 'default' || conditions.has(condition)) {
        const selected = select(target);
        if (selected !== undefined) return selected;
      }
    }
  };
  const target = select(packageExports[subpath]);
  assert.ok(
    target?.startsWith('./'),
    `Missing ${runtime}/import export: ${subpath}`,
  );
  return JSON.stringify(resolve(directory, target));
}
const fixture = resolve(process.argv[2] || directory);
const require = createRequire(resolve(fixture, 'package.json'));
const React = require('react');
const ReactDOM = require('react-dom');
const { JSDOM } = require('jsdom');
const major = Number.parseInt(React.version, 10);
const domVersion = require('react-dom/package.json').version;
assert.equal(domVersion, require('react/package.json').version);
const temporary = await mkdtemp(resolve(fixture, '.bridge-contract-'));
const filename = resolve(temporary, 'bridge.cjs');
const h = React.createElement;
const tick = () => new Promise((done) => setTimeout(done, 0));
const until = async (condition) => {
  for (let i = 0; i < 200; i++) {
    if (condition()) return;
    await tick();
  }
  assert.fail('Timed out waiting for the React commit');
};
let dom;
let hostRoot;
try {
  await build({
    absWorkingDir: directory,
    stdin: {
      resolveDir: directory,
      contents: `
        export {createReactRemote, ReactRemote} from ${runtimeEntry('./base', 'browser')};
        export {createReactRemote as createServerReactRemote} from ${runtimeEntry('./base', 'node')};
        export {createBridgeComponent} from ${runtimeEntry(major < 18 ? './base' : major === 18 ? './v18' : './v19', 'browser')};
        ${
          major >= 18
            ? `
        export {createBridgeComponent as createServerBridgeComponent} from ${runtimeEntry('./server', 'node')};
        export {BridgeSSRContext} from ${runtimeEntry('./ssr', 'node')};
        export {createBridgeSSRController} from ${runtimeEntry('./ssr-node', 'node')};`
            : ''
        }
      `,
    },
    outfile: filename,
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    external: ['react', 'react/*', 'react-dom', 'react-dom/*'],
  });
  const bridge = require(filename);
  let firstCommit;
  const mounted = new Promise((done) => (firstCommit = done));
  function Counter({ title }) {
    const [count, setCount] = React.useState(0);
    React.useEffect(() => firstCommit(), []);
    return h(
      'button',
      { onClick: () => setCount((value) => value + 1) },
      `${title}:${count}`,
    );
  }
  const browserProvider = bridge.createBridgeComponent({
    rootComponent: Counter,
  });
  const instanceFor = (factory) => ({
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
  });
  let markup = '';
  let bootstrap = '';
  const errors = [];
  if (major >= 18) {
    assert.ok(Number.parseInt(process.versions.node, 10) >= 20);
    const { renderToPipeableStream } = require('react-dom/server');
    const serverProvider = bridge.createServerBridgeComponent({
      rootComponent: Counter,
      renderStream(element, info) {
        const stream = new PassThrough();
        const render = renderToPipeableStream(element, {
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
          snapshot: Promise.resolve({}),
          abort: (reason) => render.abort(reason),
        };
      },
    });
    const controller = bridge.createBridgeSSRController({
      request: new Request('https://host.test/app'),
      shellEndMarker: '<template id="shell-end"></template>',
      identifierPrefix: 'host-',
      onError: (error) => errors.push(error),
    });
    const input = new PassThrough();
    const response = (async () => {
      let body = '';
      for await (const chunk of controller.processStream(input))
        body += chunk.toString();
      return body;
    })();
    const Remote = bridge.createServerReactRemote({
      remote: () => serverProvider,
      instance: instanceFor(serverProvider),
    });
    const render = renderToPipeableStream(
      h(
        bridge.BridgeSSRContext.Provider,
        { value: controller.context },
        h(Remote, { title: 'initial' }),
        h('template', { id: 'shell-end' }),
      ),
      {
        identifierPrefix: 'host-',
        onShellReady() {
          render.pipe(input);
        },
        onError: (error) => errors.push(error),
      },
    );
    markup = await response;
    bootstrap = controller.getBootstrap();
    assert.match(markup, /initial/);
    assert.match(markup, /"type":"done"/);
    assert.deepEqual(errors, []);
  }
  dom = new JSDOM(
    `<!doctype html><head>${bootstrap}</head><body><div id="host">${markup}</div></body>`,
    {
      runScripts: 'dangerously',
      url: 'https://host.test/app',
      beforeParse(window) {
        window.ReadableStream = ReadableStream;
        window.TextEncoder = TextEncoder;
      },
    },
  );
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
  });
  const container = document.getElementById('host');
  const originalButton = container.querySelector('button');
  const instance = instanceFor(browserProvider);
  const remote = () => browserProvider;
  const content = (title) =>
    h(
      React.Fragment,
      null,
      h(bridge.ReactRemote, { remote, instance, props: { title } }),
      major >= 18 ? h('template', { id: 'shell-end' }) : null,
    );
  if (major >= 18) {
    const { hydrateRoot } = require('react-dom/client');
    hostRoot = hydrateRoot(container, content('initial'), {
      identifierPrefix: 'host-',
      onRecoverableError: (error) => errors.push(error),
    });
    const runtime = dom.window.__MF_BRIDGE_SSR__;
    runtime.fallback = (error) => errors.push(error);
    await until(
      () => container.querySelector('button')?.textContent === 'initial:0',
    );
    // The independent provider root must have committed before interaction.
    await mounted;
    assert.equal(container.querySelector('button'), originalButton);
  } else {
    ReactDOM.render(content('initial'), container);
    await mounted;
  }
  container.querySelector('button').click();
  await until(
    () => container.querySelector('button').textContent === 'initial:1',
  );
  if (major >= 18) hostRoot.render(content('updated'));
  else ReactDOM.render(content('updated'), container);
  await until(
    () => container.querySelector('button').textContent === 'updated:1',
  );
  assert.deepEqual(errors, []);
  if (major < 18) {
    const { renderToString } = require('react-dom/server');
    const Remote = bridge.createServerReactRemote({
      remote,
      instance,
    });
    assert.throws(() => renderToString(h(Remote)), /useId/);
  } else {
    const { renderToString } = require('react-dom/server');
    const descriptor = Object.getOwnPropertyDescriptor(React, 'useId');
    const serverRemote = bridge.createServerReactRemote({
      remote,
      instance,
    });
    try {
      Object.defineProperty(React, 'useId', {
        ...descriptor,
        value: undefined,
      });
      assert.throws(() => renderToString(h(serverRemote)), /useId/);
      assert.throws(() => renderToString(content('missing API')), /useId/);
    } finally {
      Object.defineProperty(React, 'useId', descriptor);
    }
  }
  console.log(
    `React ${React.version} / React DOM ${domVersion} / ${process.version}: ${major >= 18 ? 'streaming SSR, DOM-preserving hydration' : 'legacy CSR'}, props updates and state passed`,
  );
} finally {
  if (hostRoot) hostRoot.unmount();
  else if (dom)
    ReactDOM.unmountComponentAtNode(document.getElementById('host'));
  await tick();
  dom?.window.dispatchEvent(new dom.window.Event('pagehide'));
  dom?.window.close();
  delete globalThis.window;
  delete globalThis.document;
  await rm(temporary, { recursive: true, force: true });
}
