/**
 * Real Modern application + MF transport progressive hydration regression.
 * Build modern-js-v3, Modern runtime and its workspace dependencies first:
 * node tests/progressive-hydration.cjs /path/to/react18-app /path/to/react19-app
 *
 * Each producer's server and browser are separate Rspack bundles. The browser
 * never receives a server Promise: actual Modern snapshots and update frames
 * reconstruct its data. Only registry content and deliberately held loaders are
 * fixtures; renderers, application lifecycle, framing and transport are real.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const { PassThrough } = require('node:stream');
const { rspack } = require('@rspack/core');
const { JSDOM, VirtualConsole } = require('jsdom');
const {
  bridgeStreamPlugin,
} = require('../dist/cjs/ssr-runtime/bridgeStreamPlugin.node.js');

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
  const deadline = Date.now() + 10000;
  while (!check()) {
    if (Date.now() > deadline) throw new Error(`Timed out: ${label}`);
    await delay(5);
  }
}

function sources(modernDirectory, name) {
  const modulePath = (value) =>
    JSON.stringify(path.join(modernDirectory, 'dist/esm', value));
  const shared = `
import React from 'react';
import { Await, useLoaderData } from '@modern-js/runtime-utils/router';
import { setGlobalContext } from ${modulePath('core/context/index.mjs')};
import { registerPlugin } from ${modulePath('core/plugin/index.mjs')};
export const metrics = { loaderCalls: 0, errors: [], commits: [] };
function Counter({ name, value }) {
  const [count, setCount] = React.useState(0);
  const id = React.useId();
  return React.createElement('button', {
    id, 'data-counter': name, onClick: () => setCount(old => old + 1),
  }, value + ': ' + count);
}
function Page() {
  const { label, details, secondary } = useLoaderData();
  React.useEffect(() => { metrics.commits.push(label); }, []);
  return React.createElement('main', { 'data-application': label },
    React.createElement(Counter, { name: 'shell', value: label }),
    ...[['details', details], ['secondary', secondary]].map(([name, value]) =>
      React.createElement(React.Suspense, {
        key: name,
        fallback: React.createElement('p', { 'data-pending': name }, 'Loading ' + name),
      }, React.createElement(Await, {
        resolve: value,
        errorElement: React.createElement('p', { 'data-deferred-error': name }, 'Unable to load ' + name),
      }, result => React.createElement(Counter, { name, value: result }))),
    ),
  );
}
export function install(routerPlugin, loader) {
  setGlobalContext({
    entryName: 'index',
    routes: [{ id: 'page', type: 'nested', isRoot: true, path: '/', component: Page, loader }],
  });
  registerPlugin([routerPlugin()]);
}
`;
  const server = `
import React from 'react';
import { renderApplication } from '@modern-js/runtime/application/server';
import { createModernServerBridge } from '@module-federation/modern-js-v3/bridge/application';
import { routerPlugin } from ${modulePath('router/runtime/plugin.node.mjs')};
import { install, metrics } from './shared.js';
const gates = new Map();
function gate(key) {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  promise.catch(() => {});
  gates.set(key, { resolve, reject });
  return promise;
}
install(routerPlugin, ({ request }) => {
  metrics.loaderCalls++;
  const label = new URL(request.url).searchParams.get('label');
  return { label, details: gate(label + ':details'), secondary: gate(label + ':secondary') };
});
export const provider = createModernServerBridge({ renderApplication(request, options) {
  return renderApplication(request, { ...options, onError(error) { console.error(error); } });
} });
export const version = React.version;
export function settle(label, boundary, reject = false) {
  const key = label + ':' + boundary;
  const pending = gates.get(key);
  if (!pending) throw Error('Missing loader ' + key);
  if (reject) pending.reject(Error('Deferred failure for ' + key));
  else pending.resolve(key);
  gates.delete(key);
}
export function pendingCount() { return gates.size; }
`;
  const browser = `
import React from 'react';
import { createApplication } from '@modern-js/runtime/application';
import { createModernBrowserBridge } from '@module-federation/modern-js-v3/bridge/application';
import { routerPlugin } from ${modulePath('router/runtime/plugin.mjs')};
import { install, metrics } from './shared.js';
install(routerPlugin, ({ request }) => {
  metrics.loaderCalls++;
  const query = new URL(request.url).searchParams;
  if (query.get('csr') === '1') {
    const label = query.get('label');
    return { label, details: label + ':details', secondary: label + ':secondary' };
  }
  throw Error('Hydration unexpectedly executed the browser loader');
});
const provider = createModernBrowserBridge({ createApplication })();
window.producers ||= {};
window.producers[${JSON.stringify(name)}] = {
  version: React.version, metrics, provider,
  async hydrate(id) {
    const runtime = window.__MF_BRIDGE_SSR__;
    const dom = document.getElementById(id);
    const session = runtime.claim(id, dom);
    const { snapshot, identifierPrefix, updates } = await session.ready;
    return provider.hydrate({ dom, snapshot, updates, rootOptions: {
      identifierPrefix,
      onRecoverableError(error) { metrics.errors.push(error.message); },
    } });
  },
};
`;
  return { shared, server, browser };
}

async function build(directory, appDirectory, name) {
  const requireApp = createRequire(
    path.join(path.resolve(appDirectory), 'package.json'),
  );
  const modernDirectory = path.dirname(
    requireApp.resolve('@modern-js/runtime/package.json'),
  );
  const source = sources(modernDirectory, name);
  await fs.mkdir(directory, { recursive: true });
  await Promise.all(
    Object.entries(source).map(([key, value]) =>
      fs.writeFile(path.join(directory, `${key}.js`), value),
    ),
  );
  const requests = [
    'react',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    'react-dom',
    'react-dom/client',
    'react-dom/server',
    'react-router',
    'react-router-dom',
  ];
  const aliases = Object.fromEntries(
    requests.map((request) => [`${request}$`, requireApp.resolve(request)]),
  );
  aliases['@modern-js/runtime/application$'] = requireApp.resolve(
    '@modern-js/runtime/application',
  );
  aliases['@modern-js/runtime/application/server$'] = requireApp.resolve(
    '@modern-js/runtime/application/server',
  );
  aliases['@module-federation/modern-js-v3/bridge/application$'] = path.join(
    packageDirectory,
    'dist/esm/bridge-stream/application.mjs',
  );
  const outputs = {};
  for (const target of ['server', 'browser']) {
    const node = target === 'server';
    const config = {
      mode: 'production',
      target: node ? 'node' : 'web',
      context: directory,
      entry: path.join(directory, `${target}.js`),
      output: {
        path: path.join(directory, 'dist'),
        filename: `${target}.js`,
        ...(node ? { library: { type: 'commonjs2' } } : {}),
      },
      resolve: {
        alias: aliases,
        ...(node
          ? { extensionAlias: { '.mjs': ['.node.mjs', '.server.mjs', '.mjs'] } }
          : {}),
        modules: [
          path.join(packageDirectory, 'node_modules'),
          path.join(modernDirectory, 'node_modules'),
          'node_modules',
        ],
      },
      optimization: { minimize: false, concatenateModules: false },
      plugins: [
        new rspack.DefinePlugin({
          'process.env.MODERN_ENABLE_RSC': 'false',
          'process.env.MODERN_ENABLE_HYDRATION': 'true',
        }),
      ],
    };
    await new Promise((resolve, reject) => {
      const compiler = rspack(config);
      compiler.run((error, stats) =>
        compiler.close((closeError) => {
          if (error || closeError) reject(error || closeError);
          else if (stats.hasErrors())
            reject(Error(stats.toString({ all: false, errors: true })));
          else resolve();
        }),
      );
    });
    outputs[target] = path.join(directory, 'dist', `${target}.js`);
  }
  return outputs;
}

function extenderFor(instances) {
  let create;
  bridgeStreamPlugin({ timeoutMs: 10000 }).setup({
    extendStreamSSR(callback) {
      create = callback;
    },
  });
  const extender = create();
  extender.init({
    request: new Request('https://host.example/'),
    shellEndMarker: '<!--fixture-shell-->',
    identifierPrefix: 'host-',
  });
  const context = extender.modifyRootElement(null).props.value;
  for (const instance of instances) {
    context.register(instance.id, instance.server.provider, {
      moduleName: instance.name,
      basename: '/',
      props: {},
      memoryRoute: { entryPath: '/?label=' + instance.label },
    });
  }
  return extender;
}

async function scenario(
  bundles,
  { reversed = false, rejectIndex, cancel = false } = {},
) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => errors.push(error.message));
  // Load fresh server modules so registries, loader gates and counters are scoped
  // to this scenario, just like fresh application processes in the Demo.
  const servers = bundles.map((bundle) => {
    delete require.cache[bundle.server];
    return require(bundle.server);
  });
  const instances = [
    { id: 'react18-a', name: 'react18', label: 'apple', server: servers[0] },
    { id: 'react19-a', name: 'react19', label: 'banana', server: servers[1] },
    { id: 'react18-b', name: 'react18', label: 'cherry', server: servers[0] },
  ];
  const extender = extenderFor(instances);
  const markup = instances
    .map((instance) => `<div id="${instance.id}"></div>`)
    .join('');
  const dom = new JSDOM(`<!doctype html><head></head><body>${markup}</body>`, {
    url: 'https://host.example/?csr=1',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
  });
  const { window } = dom;
  window.TextEncoder = TextEncoder;
  window.TextDecoder = TextDecoder;
  window.ReadableStream = ReadableStream;
  window.Request = Request;
  window.Response = Response;
  window.Headers = Headers;
  window.AbortController = AbortController;
  window.AbortSignal = AbortSignal;
  // A real streamed document stays loading until the response ends. JSDOM
  // finishes its supplied shell immediately; preserve the real browser signal
  // React 19 uses to distinguish pending boundaries from aborted responses.
  let documentState = 'loading';
  Object.defineProperty(window.document, 'readyState', {
    get: () => documentState,
  });
  const wire = [];
  const originalNodes = new Map();
  const originalBoundaryNodes = new Map();
  const input = new PassThrough();
  let output;
  try {
    // Run the actual plugin's early bootstrap, not a test implementation.
    const bootstrap = extender.getStyleTags();
    const script = bootstrap.match(/<script[^>]*>([\s\S]*)<\/script>/)[1];
    window.eval(script);
    const runtime = window.__MF_BRIDGE_SSR__;
    const originalAccept = runtime.accept.bind(runtime);
    runtime.accept = (id, frame) => {
      wire.push({ id, type: frame.type, frame });
      originalAccept(id, frame);
      const button = window.document.querySelector(
        `#${id} [data-counter="shell"]`,
      );
      if (button && !originalNodes.has(id)) originalNodes.set(id, button);
      const boundary = window.document.querySelector(
        `#${id} [data-counter="details"]`,
      );
      if (boundary && !originalBoundaryNodes.has(id))
        originalBoundaryNodes.set(id, boundary);
    };
    for (const bundle of bundles)
      window.eval(await fs.readFile(bundle.browser, 'utf8'));
    const hydration = instances.map((instance) => {
      const promise = window.producers[instance.name].hydrate(instance.id);
      promise.catch((error) => errors.push(instance.id + ': ' + error.message));
      return promise;
    });
    output = extender.processStream(input);
    const completed = new Promise((resolve, reject) => {
      output.on('end', resolve);
      output.on('error', reject);
    });
    completed.catch(() => {});
    output.on('data', (chunk) => {
      const text = String(chunk);
      // Each plugin frame is one complete serialized script write. The host
      // shell is already present in JSDOM and is deliberately ignored here.
      for (const match of text.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))
        window.eval(match[1]);
    });
    input.end(markup + '<!--fixture-shell-->');
    await until(
      () =>
        instances.every((instance) =>
          window.producers[instance.name].metrics.commits.includes(
            instance.label,
          ),
        ),
      'all shell hydration commits',
    );
    await Promise.all(hydration);
    assert.equal(
      wire.filter((item) => item.type === 'done').length,
      0,
      'all roots must hydrate before any slow loader is released',
    );
    for (const instance of instances) {
      const container = window.document.getElementById(instance.id);
      const button = container.querySelector('[data-counter="shell"]');
      assert.equal(
        button,
        originalNodes.get(instance.id),
        'early hydration reuses shell DOM',
      );
      assert.equal(container.querySelectorAll('[data-pending]').length, 2);
      button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      await until(
        () => button.textContent.endsWith(': 1'),
        `${instance.id} early interaction`,
      );
      assert.equal(
        container.querySelectorAll('[data-pending]').length,
        2,
        'interaction must not resolve deferred data',
      );
    }
    const pendingIds = wire
      .filter((item) => item.type === 'ready')
      .map((item) => item.frame.snapshot.pending.map((value) => value.id));
    assert.ok(
      pendingIds.every((ids) => ids.includes('0')),
      'producer-local deferred IDs deliberately collide across instances',
    );
    const cancelled = cancel ? instances[2] : undefined;
    if (cancelled) {
      const container = window.document.getElementById(cancelled.id);
      runtime.release(cancelled.id, container);
      window.producers[cancelled.name].provider.destroy({ dom: container });
      cancelled.server.settle(cancelled.label, 'details');
      cancelled.server.settle(cancelled.label, 'secondary');
      await until(() => !container.firstChild, 'cancelled root unmounted');
    }
    const active = instances.filter((instance) => instance !== cancelled);
    const rejected = instances[rejectIndex];
    const order = reversed ? [...active].reverse() : active;
    const boundaryNodes = new Map();
    for (const instance of order) {
      instance.server.settle(instance.label, 'details', instance === rejected);
      if (instance === rejected) {
        await until(() => {
          const error = window.document.querySelector(
            `#${instance.id} [data-deferred-error="details"]`,
          );
          return error && !error.closest('[hidden]');
        }, `${instance.id} deferred errorElement`);
        assert.ok(
          window.document.querySelector(
            `#${instance.id} [data-pending="secondary"]`,
          ),
        );
        continue;
      }
      await until(() => {
        const button = window.document.querySelector(
          `#${instance.id} [data-counter="details"]`,
        );
        return button && !button.closest('[hidden]');
      }, `${instance.id} visible details HTML`);
      const button = window.document.querySelector(
        `#${instance.id} [data-counter="details"]`,
      );
      assert.equal(
        button,
        originalBoundaryNodes.get(instance.id),
        'deferred hydration reuses the streamed boundary DOM',
      );
      boundaryNodes.set(instance.id, button);
      await until(
        () =>
          Object.keys(button).some((key) => key.startsWith('__reactProps$')),
        `${instance.id} hydrated details props`,
      );
      button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      await until(
        () => button.textContent.endsWith(': 1'),
        `${instance.id} selective boundary hydration`,
      );
      assert.ok(
        window.document.querySelector(
          `#${instance.id} [data-pending="secondary"]`,
        ),
      );
      assert.equal(
        wire.some((item) => item.id === instance.id && item.type === 'done'),
        false,
      );
    }
    for (const instance of [...order].reverse())
      instance.server.settle(instance.label, 'secondary');
    await completed;
    documentState = 'interactive';
    window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
    await Promise.all(active.map((instance) => runtime.get(instance.id).done));
    await delay(50);
    for (const instance of active) {
      const container = window.document.getElementById(instance.id);
      assert.equal(
        container.querySelector('[data-counter="shell"]'),
        originalNodes.get(instance.id),
      );
      if (instance === rejected) {
        assert.ok(container.querySelector('[data-deferred-error="details"]'));
      } else {
        assert.equal(
          container.querySelector('[data-counter="details"]'),
          boundaryNodes.get(instance.id),
        );
        assert.equal(
          container.querySelector('[data-counter="details"]').textContent,
          `${instance.label}:details: 1`,
        );
      }
      assert.equal(
        container.querySelector('[data-counter="shell"]').textContent,
        `${instance.label}: 1`,
      );
      assert.equal(
        container.querySelectorAll('[data-pending], [hidden]').length,
        0,
      );
      const final = container.querySelector('[data-counter="secondary"]');
      final.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      await until(
        () => final.textContent.endsWith(': 1'),
        `${instance.id} final boundary interaction`,
      );
      const frames = wire
        .filter((item) => item.id === instance.id)
        .map((item) => item.type);
      assert.ok(
        frames.indexOf('ready') < frames.indexOf('update'),
        'initial snapshot precedes deferred settlements',
      );
      assert.equal(frames.filter((type) => type === 'ready').length, 1);
      assert.equal(frames.filter((type) => type === 'done').length, 1);
    }
    for (const producer of Object.values(window.producers)) {
      assert.equal(
        producer.metrics.loaderCalls,
        0,
        'client must hydrate from transported loader data',
      );
      assert.deepEqual([...producer.metrics.errors], []);
    }
    const ids = Array.from(
      window.document.querySelectorAll('[id]'),
      (node) => node.id,
    );
    assert.equal(
      new Set(ids).size,
      ids.length,
      'useId stays isolated across React versions and repeated producer instances',
    );
    assert.equal(
      window.$RC,
      undefined,
      'completion helpers remain instance scoped',
    );
    assert.equal(
      window.document.getElementById('mf-bridge-fatal-error'),
      null,
      'no successful deferred case may trigger CSR fallback',
    );
    if (cancelled)
      assert.equal(
        window.document.getElementById(cancelled.id).innerHTML,
        '',
        'late HTML/data cannot resurrect a released instance',
      );
    assert.deepEqual(errors, []);
    return {
      order: order.map((instance) => instance.id),
      rejected: rejected?.id,
      cancelled: cancelled?.id,
      versions: servers.map((server) => server.version),
      earlyInteractiveRoots: instances.length,
      updates: wire.filter((item) => item.type === 'update').length,
      errors,
    };
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          wire: wire.map(({ id, type }) => ({ id, type })),
          errors,
          html: window.document.body.innerHTML,
          metrics: Object.fromEntries(
            Object.entries(window.producers || {}).map(([name, value]) => [
              name,
              value.metrics,
            ]),
          ),
        },
        null,
        2,
      ),
    );
    throw error;
  } finally {
    output?.destroy();
    input.destroy();
    for (const instance of instances) {
      const container = window.document.getElementById(instance.id);
      window.producers?.[instance.name]?.provider.destroy({ dom: container });
      window.__MF_BRIDGE_SSR__?.release(instance.id, container);
    }
    window.close();
  }
}

async function csrScenario(bundles) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => errors.push(error.message));
  const dom = new JSDOM(
    '<!doctype html><div id="csr18"></div><div id="csr19"></div>',
    {
      url: 'https://host.example/?csr=1',
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      virtualConsole,
    },
  );
  const { window } = dom;
  Object.assign(window, {
    TextEncoder,
    TextDecoder,
    Request,
    Response,
    Headers,
    AbortController,
    AbortSignal,
  });
  try {
    for (const bundle of bundles)
      window.eval(await fs.readFile(bundle.browser, 'utf8'));
    await Promise.all(
      [18, 19].map((version) =>
        window.producers['react' + version].provider.render({
          dom: window.document.getElementById('csr' + version),
          basename: '/',
          memoryRoute: { entryPath: '/?csr=1&label=csr' + version },
          rootOptions: { identifierPrefix: 'csr' + version + '-' },
        }),
      ),
    );
    for (const version of [18, 19]) {
      const container = window.document.getElementById('csr' + version);
      await until(
        () => container.querySelector('[data-counter="shell"]'),
        `React ${version} CSR content`,
      );
      const button = container.querySelector('[data-counter="shell"]');
      button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      await until(
        () => button.textContent.endsWith(': 1'),
        `React ${version} CSR interaction`,
      );
      assert.equal(window.producers['react' + version].metrics.loaderCalls, 1);
      assert.deepEqual(
        [...window.producers['react' + version].metrics.errors],
        [],
      );
    }
    assert.equal(
      window.__MF_BRIDGE_SSR__,
      undefined,
      'CSR mounts without any SSR transport',
    );
    assert.deepEqual(errors, []);
    return { mode: 'csr', roots: 2, errors };
  } finally {
    for (const version of [18, 19])
      window.producers?.['react' + version]?.provider.destroy({
        dom: window.document.getElementById('csr' + version),
      });
    window.close();
  }
}

(async () => {
  const temp = await fs.mkdtemp(
    path.join(os.tmpdir(), 'bridge-progressive-hydration-'),
  );
  try {
    const bundles = [];
    for (const [index, directory] of directories.entries()) {
      bundles.push(
        await build(
          path.join(temp, `react${index + 18}`),
          directory,
          `react${index + 18}`,
        ),
      );
    }
    const results = [];
    for (const options of [
      {},
      { reversed: true },
      { rejectIndex: 0 },
      { rejectIndex: 1 },
      { cancel: true },
    ])
      results.push(await scenario(bundles, options));
    results.push(await csrScenario(bundles));
    console.log(JSON.stringify({ results }, null, 2));
  } finally {
    await fs.rm(temp, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
