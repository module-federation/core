/**
 * Real React/ReactDOM + React Router streaming regression.
 * Build modern-js-v3 first, then supply directories resolving each React pair:
 * node tests/stream-react-versions.cjs /path/to/react18-app /path/to/react19-app
 * No HTTP server, mocked renderer, or Demo-side runtime is involved.
 */
const assert = require('node:assert/strict');
// This matrix checks the production renderer used by the built applications.
// In development, SSR and hydration in one Node realm also share Router's
// context diagnostics; real server and browser bundles have separate realms.
process.env.NODE_ENV ||= 'production';
const { createRequire } = require('node:module');
const path = require('node:path');
const { PassThrough } = require('node:stream');
const { JSDOM, VirtualConsole } = require('jsdom');
const {
  bridgeStreamBootstrap,
} = require('../dist/cjs/bridge-stream/bootstrap.js');
const { htmlFrames } = require('../dist/cjs/bridge-stream/frames.server.js');
// AST rewriting and transport must be the framework implementation under test.
const {
  isolateReactStreamScripts,
} = require('../dist/cjs/bridge-stream/script-isolation.server.js');

const [directory18, directory19] = process.argv.slice(2);
if (!directory18 || !directory19) {
  throw new Error(
    'Pass two package directories resolving React 18 and React 19.',
  );
}
function renderer(directory) {
  const requireApp = createRequire(
    path.join(path.resolve(directory), 'package.json'),
  );
  const React = requireApp('react');
  const server = requireApp('react-dom/server');
  const Router = requireApp('react-router');
  return { React, server, Router, requireApp };
}
const pair18 = renderer(directory18);
const pair19 = renderer(directory19);
assert.match(pair18.React.version, /^18\./);
assert.match(pair19.React.version, /^19\./);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(condition, label, timeout = 4000) {
  const end = Date.now() + timeout;
  while (!condition()) {
    if (Date.now() > end) throw new Error(`Timed out waiting for ${label}`);
    await delay(5);
  }
}
function application({ React, Router }, label) {
  const gates = [0, 1].map((index) => {
    const value = `${label}-${index}`;
    let release;
    const promise = new Promise((resolve) => {
      release = () => resolve(value);
    });
    return { value, promise, release };
  });
  function Counter({ value }) {
    const id = React.useId();
    const [count, setCount] = React.useState(0);
    return React.createElement(
      'button',
      { id, onClick: () => setCount((old) => old + 1) },
      `${value}: ${count}`,
    );
  }
  function App({ snapshot = false }) {
    return React.createElement(
      'section',
      null,
      gates.map((gate, index) =>
        React.createElement(
          React.Suspense,
          {
            key: index,
            fallback: React.createElement(
              'p',
              { 'data-pending': `${label}-${index}` },
              'Loading',
            ),
          },
          React.createElement(
            Router.Await,
            { resolve: snapshot ? gate.value : gate.promise },
            (value) => React.createElement(Counter, { value }),
          ),
        ),
      ),
    );
  }
  return { gates, App };
}
async function scenario(order) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => errors.push(error.message));
  const dom = new JSDOM(
    '<!doctype html><div id="remote18"></div><div id="remote19"></div>',
    {
      url: 'https://host.example/?csr=1',
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      virtualConsole,
    },
  );
  const window = dom.window;
  window.TextEncoder = TextEncoder;
  const bootstrap = window.document.createElement('script');
  bootstrap.textContent = `(${bridgeStreamBootstrap.toString()})({timeoutMs:4000})`;
  window.document.head.appendChild(bootstrap);
  bootstrap.remove();
  const runtime = window.__MF_BRIDGE_SSR__;
  const roots = [];
  const renders = [];
  const previous = new Map(
    [
      'window',
      'document',
      'navigator',
      'requestAnimationFrame',
      'cancelAnimationFrame',
    ].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  const install = (key, value) =>
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  install('window', window);
  install('document', window.document);
  install('navigator', window.navigator);
  install('requestAnimationFrame', window.requestAnimationFrame.bind(window));
  install('cancelAnimationFrame', window.cancelAnimationFrame.bind(window));
  try {
    const apps = [application(pair18, 'A'), application(pair19, 'B')];
    const pairs = [pair18, pair19];
    const ids = ['remote18', 'remote19'];
    const received = [[], []];
    const completions = [];
    for (const [index, pair] of pairs.entries()) {
      const id = ids[index];
      const prefix = `${id}-`;
      const transformScripts = (html) =>
        isolateReactStreamScripts(html, id, prefix);
      const stream = new PassThrough();
      const framer = htmlFrames();
      stream.pipe(framer);
      runtime.accept(id, {
        type: 'meta',
        protocol: 'mf-bridge/1',
        identifierPrefix: prefix,
      });
      framer.on('data', (html) => {
        received[index].push(html);
        runtime.accept(id, { type: 'html', html: transformScripts(html) });
      });
      framer.on('error', (error) => errors.push(error.message));
      framer.on('end', () => {
        runtime.accept(id, { type: 'data', snapshot: { label: id } });
        runtime.accept(id, { type: 'done' });
      });
      const rendered = pair.server.renderToPipeableStream(
        pair.React.createElement(apps[index].App),
        {
          identifierPrefix: prefix,
          onShellReady() {
            rendered.pipe(stream);
          },
          onError(error) {
            errors.push(error.message);
          },
        },
      );
      renders.push(rendered);
      const completion = runtime.get(id).done.then(() => {
        const container = window.document.getElementById(id);
        // React 19 schedules DOM movement after its completion script returns.
        // A transport "done" must wait for those real markers to be consumed.
        assert.equal(
          container.querySelector('[data-pending]'),
          null,
          `${id} resolved done with a pending fallback`,
        );
        assert.equal(
          container.querySelector('[hidden]'),
          null,
          `${id} resolved done with hidden segments`,
        );
        const buttons = Array.from(container.querySelectorAll('button'));
        assert.equal(buttons.length, 2);
        const client = pair.requireApp('react-dom/client');
        roots.push(
          client.hydrateRoot(
            container,
            pair.React.createElement(apps[index].App, { snapshot: true }),
            {
              identifierPrefix: prefix,
              onRecoverableError(error) {
                errors.push(`${id}: ${error.message}`);
              },
            },
          ),
        );
        return { container, buttons };
      });
      completion.catch(() => {});
      completions.push(completion);
    }
    await until(() => received.every((frames) => frames.length), 'both shells');
    for (const step of order) {
      const [app, boundary] = step;
      const before = received[app].length;
      apps[app].gates[boundary].release();
      await until(
        () => received[app].length > before,
        `${app}/${boundary} stream frame`,
      );
      // Preserve interleaving while allowing each script to execute naturally.
      await delay(10);
    }
    const results = await Promise.all(completions);
    await delay(100);
    for (const { container, buttons } of results) {
      assert.deepEqual(
        Array.from(container.querySelectorAll('button')),
        buttons,
        'hydration must reuse server DOM',
      );
      buttons[0].dispatchEvent(
        new window.MouseEvent('click', { bubbles: true }),
      );
      await until(
        () => buttons[0].textContent.endsWith(': 1'),
        'hydrated click handler',
      );
      assert.ok(
        buttons[1].textContent.endsWith(': 0'),
        'state must stay inside its own component',
      );
    }
    const idsInDocument = Array.from(
      window.document.querySelectorAll('[id]'),
      (element) => element.id,
    );
    assert.equal(
      new Set(idsInDocument).size,
      idsInDocument.length,
      'React IDs must not collide',
    );
    assert.equal(
      window.$RC,
      undefined,
      'remote helpers must not overwrite host globals',
    );
    assert.deepEqual(errors, []);
    return {
      order,
      chunks: received.map((frames) => frames.length),
      hydrationErrors: errors.length,
    };
  } finally {
    roots.forEach((root) => root.unmount());
    renders.forEach((render) => render.abort());
    // Let React 19's scheduler finish the unmount before removing browser globals.
    await delay(100);
    window.close();
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}
(async () => {
  const orders = [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    [
      [1, 0],
      [0, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [0, 1],
      [1, 1],
      [0, 0],
      [1, 0],
    ],
  ];
  const results = [];
  for (const order of orders) results.push(await scenario(order));
  console.log(
    JSON.stringify(
      { versions: [pair18.React.version, pair19.React.version], results },
      null,
      2,
    ),
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
