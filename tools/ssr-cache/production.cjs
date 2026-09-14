const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { once } = require('node:events');
const mf = path.resolve(__dirname, '../..');
const modern = process.env.SSR_CACHE_MODERN_ROOT;
const installed = process.env.SSR_CACHE_PACKAGES_ROOT;
const packageRequire = installed
  ? require('node:module').createRequire(path.join(installed, 'package.json'))
  : require;
if ((!modern && !installed) || !global.gc)
  throw new Error(
    'Set SSR_CACHE_MODERN_ROOT or SSR_CACHE_PACKAGES_ROOT and run node --expose-gc tools/ssr-cache/production.cjs',
  );
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
let root;
const { createProdServer } = installed
  ? packageRequire('@modern-js/prod-server')
  : require(path.join(modern, 'packages/server/prod-server/dist/cjs'));
const { createSSRUpdateAdapter } = installed
  ? packageRequire('@module-federation/modern-js-v3/server')
  : require(path.join(mf, 'packages/modernjs-v3/dist/cjs/server/ssrUpdate.js'));
(async () => {
  root = await fs.mkdtemp(
    path.join(require('node:os').tmpdir(), 'mf-production-'),
  );
  console.log('Production fixture', root);
  if (installed) {
    const audit = {};
    for (const name of [
      '@module-federation/modern-js-v3',
      '@modern-js/app-tools',
      '@modern-js/runtime',
      '@modern-js/server-core',
      '@modern-js/prod-server',
      '@rspack/core',
      'react',
      'react-dom',
    ]) {
      const directory = await fs.realpath(
        path.join(installed, 'node_modules', name),
      );
      assert.ok(
        directory.startsWith((await fs.realpath(installed)) + path.sep),
      );
      const metadata = JSON.parse(
        await fs.readFile(path.join(directory, 'package.json')),
      );
      audit[name] = { version: metadata.version, directory };
    }
    await fs.writeFile(
      path.join(root, 'packages.json'),
      JSON.stringify(audit, null, 2),
    );
    console.log('Published package audit', audit);
  }
  const asset = http.createServer(async (req, res) => {
    try {
      const file = path.resolve(
        root,
        'releases',
        '.' + new URL(req.url, 'http://x').pathname,
      );
      if (!file.startsWith(path.join(root, 'releases') + path.sep))
        throw Error();
      const data = await fs.readFile(file);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Content-Type',
        file.endsWith('.json') ? 'application/json' : 'application/javascript',
      );
      res.end(data);
    } catch {
      res.statusCode = 404;
      res.end('missing');
    }
  });
  asset.listen(0, '127.0.0.1');
  await once(asset, 'listening');
  const assetURL = `http://127.0.0.1:${asset.address().port}`;
  const build = spawn(
    process.execPath,
    [path.join(__dirname, 'production-fixture.cjs')],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        SSR_CACHE_PRODUCTION_DIR: root,
        SSR_CACHE_ASSET_URL: assetURL,
        SSR_CACHE_RSPACK_ENTRY: require('node:fs').realpathSync(
          packageRequire.resolve('@rspack/core'),
        ),
        NODE_OPTIONS: `--require=${path.join(__dirname, 'local-rspack-hook.cjs')}`,
      },
    },
  );
  const [code, signal] = await once(build, 'exit');
  if (code !== 0) {
    asset.close();
    throw new Error(`Build failed: ${code ?? signal}`);
  }
  const initial = { name: 'remote', entry: `${assetURL}/v1/mf-manifest.json` };
  const adapter = createSSRUpdateAdapter({
    name: 'r6_host',
    entries: ['index'],
    hydration: { remotes: [initial] },
  });
  let application;
  let server;
  let failValidation = false;
  try {
    server = await createProdServer({
      pwd: path.join(root, 'host/dist'),
      serverConfigPath: path.join(root, 'missing-config'),
      config: {
        server: { ssr: true },
        output: {},
        source: {},
        tools: {},
        html: {},
        bff: {},
        dev: {},
        security: {},
      },
      appContext: { apiDirectory: '', lambdaDirectory: '' },
      routes: JSON.parse(
        await fs.readFile(path.join(root, 'host/dist/route.json')),
      ).routes,
      ssrApplication: {
        maxPendingRequests: 16,
        requestTimeoutMs: 500,
        drainTimeoutMs: 1000,
        onReady(a) {
          application = a;
        },
        resolveScope() {
          return ['index'];
        },
        reloadEntry: adapter.reload,
        async dispose(_, entries) {
          adapter.dispose(entries);
        },
        async validate(resources) {
          if (failValidation) throw new Error('injected validation failure');
          adapter.prepareResources(resources);
        },
        async bypass(request) {
          const url = new URL(request.url);
          if (url.pathname === '/__live') return new Response('live');
          if (url.pathname === '/__ready')
            return new Response(application.status.phase, {
              status: application.status.phase === 'serving' ? 200 : 503,
            });
          if (url.pathname === '/__update') {
            const version = url.searchParams.get('v') || 'v2';
            try {
              const result = await adapter.update(application, 'remote', {
                entry: `${assetURL}/${version}/mf-manifest.json`,
                client: { entry: `${assetURL}/${version}/mf-manifest.json` },
              });
              return Response.json(result);
            } catch (e) {
              console.error(e);
              return new Response(String(e.stack), { status: 500 });
            }
          }
        },
      },
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const hostURL = `http://127.0.0.1:${server.address().port}`;
    const originalAddress = server.address();
    const originalPID = process.pid;
    const response = await fetch(`${hostURL}/`);
    const html = await response.text();
    console.log(
      'FIRST',
      response.status,
      html.includes('v1'),
      html.slice(0, 200),
    );
    assert.equal(response.status, 200);
    assert.ok(html.includes('v1'));
    const cypress = require(path.join(mf, 'node_modules/cypress'));
    await fs.writeFile(
      path.join(root, 'cypress.config.cjs'),
      `module.exports={video:false,screenshotOnRunFailure:false,e2e:{supportFile:false,specPattern:'release.cy.cjs',baseUrl:'${hostURL}'}}`,
    );
    await fs.writeFile(
      path.join(root, 'release.cy.cjs'),
      `describe('release hydration',()=>{it('pins old and new HTML',()=>{let old;cy.request('/').then(r=>{old=r.body;expect(old).to.contain('v1');});cy.visit('/');cy.get('body').should(b=>expect(b.text()).to.contain('v1:0'));cy.get('#remote-counter').should('have.attr','data-hydrated','true').should('have.text','v1:0').click().should('have.text','v1:1');cy.request('/__update?v=v2').its('status').should('eq',200);cy.request('/').its('body').should('contain','v2');cy.visit('/',{onBeforeLoad(win){cy.spy(win.console,'error').as('errors')}});cy.get('#remote-counter').should('have.attr','data-hydrated','true').should('have.text','v2:0').click().should('have.text','v2:1');cy.get('@errors').should('not.have.been.called');cy.then(()=>cy.intercept('GET','${hostURL}/',{statusCode:200,headers:{'content-type':'text/html'},body:old}));cy.visit('/',{onBeforeLoad(win){cy.spy(win.console,'error').as('oldErrors')}});cy.get('#remote-counter').should('have.attr','data-hydrated','true').should('have.text','v1:0').click().should('have.text','v1:1');cy.get('@oldErrors').should('not.have.been.called');});});`,
    );
    const result = await cypress.run({
      project: root,
      browser: 'electron',
      headless: true,
    });
    assert.equal(result.totalTests, 1);
    assert.equal(result.totalPassed, 1);
    assert.equal(result.totalFailed, 0);
    const deferred = () => {
      let resolve;
      const promise = new Promise((r) => (resolve = r));
      return { promise, resolve };
    };
    const waitFor = async (predicate) => {
      const deadline = Date.now() + 5000;
      while (!predicate()) {
        assert.ok(Date.now() < deadline, 'state transition timed out');
        await new Promise((r) => setTimeout(r, 5));
      }
    };
    const update = (version = 'v1') =>
      adapter.update(application, 'remote', {
        entry: `${assetURL}/${version}/mf-manifest.json`,
        client: { entry: `${assetURL}/${version}/mf-manifest.json` },
      });
    const health = async (ready) => {
      assert.equal((await fetch(`${hostURL}/__live`)).status, 200);
      assert.equal((await fetch(`${hostURL}/__ready`)).status, ready);
    };
    const data = await fetch(`${hostURL}/?__loader=page`);
    assert.equal(data.status, 200);
    assert.match(await data.text(), /loader-ready/);
    const action = await fetch(`${hostURL}/?__loader=page`, {
      method: 'POST',
      body: 'action-payload',
    });
    assert.equal(action.status, 200);
    assert.match(await action.text(), /action-payload/);
    // A real React Suspense response keeps the old generation admitted after its shell.
    const stream = deferred();
    const started = deferred();
    globalThis.__r6Stream = {
      promise: stream.promise,
      started: started.resolve,
    };
    const responseStream = await fetch(`${hostURL}/`, {
      signal: AbortSignal.timeout(5000),
      headers: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'x-should-stream-all': 'false',
      },
    });
    const reader = responseStream.body.getReader();
    await started.promise;
    const first = await reader.read();
    assert.equal(first.done, false);
    const streamUpdate = update();
    await waitFor(() => application.status.phase === 'draining');
    await health(503);
    stream.resolve();
    delete globalThis.__r6Stream;
    while (!(await reader.read()).done) {}
    await streamUpdate;
    await health(200);
    // Aborting a loader response cannot erase producer work that is still running.
    const held = deferred();
    const entered = deferred();
    globalThis.__r6Loader = async () => {
      entered.resolve();
      await held.promise;
    };
    const abort = new AbortController();
    const heldRequest = fetch(`${hostURL}/?__loader=page`, {
      signal: abort.signal,
    }).catch((e) => e);
    await entered.promise;
    const heldUpdate = update('v2');
    const rejectedUpdate = heldUpdate.catch((e) => e);
    await waitFor(() => application.status.phase === 'draining');
    abort.abort();
    await heldRequest;
    const queuedAbort = new AbortController();
    const cancelled = fetch(`${hostURL}/`, {
      signal: queuedAbort.signal,
    }).catch((error) => error);
    await waitFor(() => application.status.pendingRequests === 1);
    queuedAbort.abort();
    await cancelled;
    await waitFor(() => application.status.pendingRequests === 0);
    const actionCount = globalThis.__r6Actions;
    const queued = Array.from({ length: 16 }, (_, index) =>
      fetch(
        index === 0 ? `${hostURL}/?__loader=page` : `${hostURL}/`,
        index === 0 ? { method: 'POST', body: 'must-not-run' } : {},
      ).then(async (r) => {
        await r.text();
        return r.status;
      }),
    );
    await waitFor(() => application.status.pendingRequests === 16);
    const overflow = await fetch(`${hostURL}/`);
    assert.equal(overflow.status, 503);
    await overflow.text();
    assert.ok((await Promise.all(queued)).every((code) => code === 503));
    assert.equal(globalThis.__r6Actions, actionCount);
    const drainFailure = await rejectedUpdate;
    assert.ok(drainFailure instanceof Error);
    assert.equal(drainFailure.failedStage, 'drain');
    held.resolve();
    delete globalThis.__r6Loader;
    await waitFor(() => application.status.activeRequests === 0);
    await update('v2');
    await health(200);
    // Request-side updates must reject, rather than wait for their own request.
    globalThis.__r6Loader = async () => {
      await assert.rejects(update('v1'));
    };
    const reentry = await fetch(`${hostURL}/?__loader=page`);
    assert.equal(reentry.status, 200);
    await reentry.text();
    delete globalThis.__r6Loader;
    // A runtime-only registration has no compiler-known edge and uses full rebuild.
    const dynamic = await adapter.updateRemotes(application, [
      {
        name: 'runtime_only',
        entry: `${assetURL}/v2/mf-manifest.json`,
        client: { entry: `${assetURL}/v2/mf-manifest.json` },
      },
    ]);
    assert.equal(dynamic.mode, 'application');
    globalThis.__r6Loader = async () => {
      const host = globalThis.__FEDERATION__.__INSTANCES__.find(
        (i) => i.name === 'r6_host',
      );
      const dynamicName = ['runtime', 'only'].join('_');
      const loaded = await host.loadRemote(dynamicName + '/Counter');
      assert.equal(loaded.release, 'v2');
    };
    const dynamicData = await fetch(`${hostURL}/?__loader=page`);
    assert.equal(dynamicData.status, 200);
    await dynamicData.text();
    delete globalThis.__r6Loader;
    // Failed publication keeps the listener alive and readiness closed until recovery.
    failValidation = true;
    const failed = await update('v1').catch((e) => e);
    assert.ok(failed instanceof Error);
    assert.equal(failed.failedStage, 'rebuild');
    assert.equal(application.status.phase, 'unavailable');
    await health(503);
    const unavailable = await fetch(`${hostURL}/`);
    assert.equal(unavailable.status, 503);
    await unavailable.text();
    failValidation = false;
    const recovered = await update('v1');
    assert.equal(recovered.mode, 'application');
    await health(200);
    {
      const samples = [];
      const durations = [];
      const inspect = async () => {
        await new Promise((r) => setImmediate(r));
        global.gc?.();
        await new Promise((r) => setImmediate(r));
        global.gc?.();
        return {
          ...process.memoryUsage(),
          resources: process.getActiveResourcesInfo().reduce((counts, name) => {
            counts[name] = (counts[name] || 0) + 1;
            return counts;
          }, {}),
          plugins: globalThis.__FEDERATION__.__INSTANCES__.map((i) => ({
            name: i.name,
            plugins: i.options.plugins.map((p) => p.name),
          })),
          instances: globalThis.__FEDERATION__.__INSTANCES__.length,
          bindings: globalThis.__FEDERATION__.__INSTANCES__
            .filter((i) => i.name === 'r6_host')
            .map(
              (i) =>
                i[Symbol.for('module-federation.clear-cache.adapters')]
                  ?.bindings.size || 0,
            ),
          status: application.status,
        };
      };
      const cycles = Number(process.env.SSR_CACHE_PRODUCTION_CYCLES || 70);
      assert.ok(Number.isSafeInteger(cycles) && cycles >= 70);
      for (let i = 0; i < cycles; i++) {
        const version = i % 2 ? 'v1' : 'v2';
        const pending = adapter.update(application, 'remote', {
          entry: `${assetURL}/${version}/mf-manifest.json`,
          client: { entry: `${assetURL}/${version}/mf-manifest.json` },
        });
        const requests = Array.from({ length: 8 }, async () => {
          const response = await fetch(`${hostURL}/`);
          assert.equal(response.status, 200);
          const body = await response.text();
          const serverVersion = body.match(
            /id="remote-counter"[^>]*>(v[12]):/,
          )[1];
          const metadata = JSON.parse(
            body.match(/data-modern-mf-release>(.*?)<\/script>/)[1],
          );
          assert.ok(
            metadata.remotes[0].entry.includes('/' + serverVersion + '/'),
          );
        });
        const result = await pending;
        durations.push(result.timingsMs);
        await Promise.all(requests);
        if (i % 10 === 9) {
          const sample = await inspect();
          samples.push(sample);
          console.log('SOAK', i + 1, JSON.stringify(sample));
        }
      }
      assert.equal(process.pid, originalPID);
      assert.deepEqual(server.address(), originalAddress);
      const warm = samples[1].heapUsed;
      const peak = Math.max(...samples.slice(2).map((s) => s.heapUsed));
      assert.ok(
        peak - warm < 8 * 1024 * 1024,
        `Post-GC heap grew ${(peak - warm) / 1024 / 1024} MiB after warm-up`,
      );
      assert.ok(
        samples.every(
          (s) =>
            s.instances === 2 &&
            s.bindings.every((n) => n === 2) &&
            s.status.activeRequests === 0 &&
            s.status.pendingRequests === 0,
        ),
      );
      await fs.writeFile(
        path.join(root, 'metrics.json'),
        JSON.stringify({ samples, durations }, null, 2),
      );
      console.log(
        'Production acceptance passed; metrics:',
        path.join(root, 'metrics.json'),
      );
      return;
    }
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    server?.closeAllConnections();
    if (server) await new Promise((r) => server.close(r));
    asset.closeAllConnections();
    await new Promise((r) => asset.close(r));
    adapter.dispose();
    delete globalThis.__r6Actions;
    delete globalThis.__r6Loader;
    delete globalThis.__r6Stream;
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
