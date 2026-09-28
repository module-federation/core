/**
 * Exercise the published Bridge boundaries through real Rspack builds.
 * Build bridge-react and modern-js-v3 first, then run:
 * node tests/bridge-platform-build.cjs /path/to/react18-app /path/to/react19-app
 *
 * The provider below is a minimal React application fixture. Both renderers,
 * Bridge consumers, the Rspack plugin and the browser stream bootstrap are real.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const { rspack } = require('@rspack/core');
const { JSDOM, VirtualConsole } = require('jsdom');
const { BridgeSSRPlugin } = require('../dist/cjs/rspack/index.js');
const {
  bridgeStreamBootstrap,
} = require('../dist/cjs/bridge-stream/bootstrap.js');

process.env.NODE_ENV = 'production';
const directories = process.argv.slice(2);
assert.equal(
  directories.length,
  2,
  'Pass React 18 and React 19 app directories.',
);
const packageDirectory = path.resolve(__dirname, '..');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(check, label) {
  const deadline = Date.now() + 5000;
  while (!check()) {
    if (Date.now() >= deadline) throw new Error(`Timed out: ${label}`);
    await delay(10);
  }
}

const sharedSource = `
import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createRemoteAppComponent } from '@module-federation/bridge-react/base';
export const calls = { render: [], hydrate: [], destroy: [], errors: [] };
export function RemoteContent({ label }) {
  const id = React.useId();
  const [count, setCount] = React.useState(0);
  return React.createElement('button', {
    id, 'data-remote-label': label, onClick: () => setCount(value => value + 1),
  }, label + ': ' + count);
}
function provider() {
  let root;
  return {
    render({ dom, label }) {
      calls.render.push(label);
      root ||= createRoot(dom);
      root.render(React.createElement(RemoteContent, { label }));
    },
    hydrate({ dom, snapshot, rootOptions }) {
      calls.hydrate.push(snapshot.label);
      root = hydrateRoot(dom, React.createElement(RemoteContent, snapshot), {
        ...rootOptions,
        onRecoverableError(error) {
          calls.errors.push(error.message);
          rootOptions.onRecoverableError?.(error);
        },
      });
    },
    destroy() {
      calls.destroy.push(true);
      root?.unmount();
    },
  };
}
const Remote = createRemoteAppComponent({
  loader: async () => ({ default: provider }),
  loading: React.createElement('span', null, 'Loading'),
  fallback: ({ error }) => React.createElement('pre', { 'data-failure': true }, error.message),
});
export function Host({ labels = ['A', 'B'] }) {
  const id = React.useId();
  return React.createElement('main', { id },
    React.createElement('h1', null, 'Bridge platform test'),
    labels.map((label, index) => React.createElement(Remote, { key: index, label })),
  );
}
`;
const serverSource = `
import React from 'react';
import { renderToPipeableStream, renderToString } from 'react-dom/server';
import { PassThrough } from 'node:stream';
import { BridgeSSRContext } from '@module-federation/bridge-react/ssr';
import { Host, RemoteContent } from './shared.js';
export async function render() {
  const jobs = new Map();
  const context = {
    register(id, factory, params, options) {
      if (!options?.deferRender) jobs.set(id, params);
    },
  };
  const output = new PassThrough();
  const chunks = [];
  output.on('data', chunk => chunks.push(chunk));
  const completed = new Promise((resolve, reject) => {
    output.on('end', resolve);
    output.on('error', reject);
  });
  const stream = renderToPipeableStream(
    React.createElement(BridgeSSRContext.Provider, { value: context },
      React.createElement(Host)),
    {
      identifierPrefix: 'host-',
      onAllReady() { stream.pipe(output); },
      onError(error) { output.destroy(error); },
    },
  );
  await completed;
  return {
    html: Buffer.concat(chunks).toString(),
    jobs: Array.from(jobs, ([id, params]) => ({
      id,
      snapshot: params.props,
      identifierPrefix: id + '-',
      html: renderToString(React.createElement(RemoteContent, params.props), {
        identifierPrefix: id + '-',
      }),
    })),
  };
}
`;
const browserSource = `
import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { Host, calls } from './shared.js';
let root;
window.bridgeFixture = {
  calls,
  start(hydrate) {
    const container = document.getElementById('host');
    const element = React.createElement(Host);
    root = hydrate
      ? hydrateRoot(container, element, {
          identifierPrefix: 'host-',
          onRecoverableError(error) { calls.errors.push(error.message); },
        })
      : createRoot(container);
    if (!hydrate) root.render(element);
  },
  update() { root.render(React.createElement(Host, { labels: ['C', 'D'] })); },
  unmount() { root.unmount(); },
};
`;

async function build(directory, requireApp, node, plugin = node) {
  const target = node ? 'server' : 'browser';
  const reactRequests = [
    'react',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    'react-dom',
    'react-dom/client',
    'react-dom/server',
  ];
  const reactPaths = Object.fromEntries(
    reactRequests.map((request) => [request, requireApp.resolve(request)]),
  );
  const config = {
    mode: 'production',
    target: node ? 'node' : 'web',
    context: directory,
    entry: path.join(directory, `${target}.js`),
    output: {
      path: path.join(directory, 'dist'),
      filename: `${target}-${plugin ? 'plugin' : 'plain'}.cjs`,
      ...(node ? { library: { type: 'commonjs2' } } : {}),
    },
    resolve: {
      alias: Object.fromEntries(
        Object.entries(reactPaths).map(([key, value]) => [`${key}$`, value]),
      ),
      modules: [path.join(packageDirectory, 'node_modules'), 'node_modules'],
    },
    optimization: { minimize: false, concatenateModules: false },
    plugins: plugin ? [new BridgeSSRPlugin()] : [],
    ...(node
      ? {
          externals: Object.fromEntries(
            Object.entries(reactPaths).map(([key, value]) => [
              key,
              `commonjs ${value}`,
            ]),
          ),
        }
      : {}),
  };
  const stats = await new Promise((resolve, reject) => {
    const compiler = rspack(config);
    compiler.run((error, result) => {
      compiler.close((closeError) => {
        if (error || closeError) reject(error || closeError);
        else if (result.hasErrors()) {
          reject(new Error(result.toString({ all: false, errors: true })));
        } else resolve(result);
      });
    });
  });
  const graph = stats.toJson({ all: false, modules: true }).modules;
  const modules = graph.map((module) => module.name).filter(Boolean);
  const serverLifecycle = modules.filter((name) =>
    /remote-lifecycle\.server\.(?:es|cjs)\.js/.test(name),
  );
  const browserLifecycle = modules.filter((name) =>
    /remote-lifecycle\.(?:es|cjs)\.js/.test(name),
  );
  assert.equal(
    serverLifecycle.length,
    node && plugin ? 1 : 0,
    `${target} server lifecycle`,
  );
  assert.equal(
    browserLifecycle.length,
    node && plugin ? 0 : 1,
    `${target} browser lifecycle`,
  );
  return path.join(
    directory,
    'dist',
    `${target}-${plugin ? 'plugin' : 'plain'}.cjs`,
  );
}

async function browserScenario(browserFile, rendered) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => errors.push(error.message));
  const dom = new JSDOM(
    `<!doctype html><div id="host">${rendered?.html || ''}</div>`,
    {
      url: 'https://host.example/?csr=1',
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      virtualConsole,
    },
  );
  const { window } = dom;
  window.TextEncoder = TextEncoder;
  const before = Array.from(
    window.document.querySelectorAll('[data-mf-bridge-root]'),
  );
  const serverIds = before.map((element) => element.id);
  try {
    if (rendered) {
      assert.equal(before.length, 2, 'SSR must emit both Remote containers');
      assert.equal(
        new Set(serverIds).size,
        2,
        'same Remote needs distinct IDs',
      );
      assert.deepEqual(
        rendered.jobs.map((job) => job.id),
        serverIds,
        'server lifecycle registrations must match shared JSX containers',
      );
      window.eval(`(${bridgeStreamBootstrap.toString()})({timeoutMs:5000})`);
      for (const job of rendered.jobs) {
        const runtime = window.__MF_BRIDGE_SSR__;
        runtime.accept(job.id, {
          type: 'meta',
          protocol: 'mf-bridge/1',
          identifierPrefix: job.identifierPrefix,
        });
        runtime.accept(job.id, { type: 'html', html: job.html });
        runtime.accept(job.id, { type: 'data', snapshot: job.snapshot });
        runtime.accept(job.id, { type: 'done' });
        await runtime.get(job.id).done;
      }
    }
    const serverButtons = Array.from(
      window.document.querySelectorAll('button'),
    );
    window.eval(await fs.readFile(browserFile, 'utf8'));
    const fixture = window.bridgeFixture;
    fixture.start(Boolean(rendered));
    await until(
      () =>
        window.document.querySelectorAll('[data-remote-label]').length === 2,
      'both Remote applications',
    );
    await until(
      () =>
        (rendered ? fixture.calls.hydrate : fixture.calls.render).length === 2,
      'both Remote lifecycles',
    );
    await delay(100);
    const containers = Array.from(
      window.document.querySelectorAll('[data-mf-bridge-root]'),
    );
    const buttons = Array.from(window.document.querySelectorAll('button'));
    if (rendered) {
      assert.deepEqual(
        containers,
        before,
        'Host hydration must reuse containers',
      );
      assert.deepEqual(
        buttons,
        serverButtons,
        'Remote hydration must reuse DOM',
      );
      assert.deepEqual(
        [...fixture.calls.render],
        [],
        'SSR must start with hydrate',
      );
    } else {
      assert.equal(
        window.__MF_BRIDGE_SSR__,
        undefined,
        'CSR needs no SSR runtime',
      );
      assert.deepEqual(
        [...fixture.calls.hydrate],
        [],
        'generic CSR must mount',
      );
    }
    buttons[0].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    await until(() => buttons[0].textContent === 'A: 1', 'first Remote click');
    assert.equal(buttons[1].textContent, 'B: 0', 'independent Remote state');
    fixture.update();
    await until(
      () =>
        buttons[0].textContent === 'C: 1' && buttons[1].textContent === 'D: 0',
      'updates preserve both independent roots',
    );
    fixture.unmount();
    await until(
      () => fixture.calls.destroy.length === 2,
      'both roots destroyed',
    );
    assert.deepEqual([...fixture.calls.errors, ...errors], []);
    return {
      mode: rendered ? 'hydrate' : 'csr',
      containers: containers.length,
    };
  } finally {
    window.close();
  }
}

(async () => {
  const temp = await fs.mkdtemp(
    path.join(os.tmpdir(), 'bridge-platform-build-'),
  );
  const results = [];
  try {
    for (const [index, input] of directories.entries()) {
      const requireApp = createRequire(
        path.join(path.resolve(input), 'package.json'),
      );
      const version = requireApp('react').version;
      assert.match(version, index === 0 ? /^18\./ : /^19\./);
      const directory = path.join(temp, `react${index + 18}`);
      await fs.mkdir(directory);
      await Promise.all([
        fs.writeFile(path.join(directory, 'shared.js'), sharedSource),
        fs.writeFile(path.join(directory, 'server.js'), serverSource),
        fs.writeFile(path.join(directory, 'browser.js'), browserSource),
      ]);
      const serverFile = await build(directory, requireApp, true);
      const browserFile = await build(directory, requireApp, false);
      // The plugin must be harmless in a browser compilation, and Node without
      // Modern's plugin must retain the ordinary CSR-compatible Bridge entry.
      await build(directory, requireApp, false, true);
      const plainNodeFile = await build(directory, requireApp, true, false);
      assert.equal((await require(plainNodeFile).render()).jobs.length, 0);
      const rendered = await require(serverFile).render();
      results.push({
        version,
        scenarios: [
          await browserScenario(browserFile, rendered),
          await browserScenario(browserFile),
        ],
      });
    }
    console.log(JSON.stringify({ results }, null, 2));
  } finally {
    await fs.rm(temp, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
