const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { once } = require('node:events');
const { fork, spawn } = require('node:child_process');
const dir = __dirname;
const installed =
  process.env.SSR_CACHE_PACKAGES_ROOT || path.resolve(dir, 'host');
const r = require('node:module').createRequire(
  path.join(installed, 'package.json'),
);
const children = new Set();
const hosts = {};
const samples = { static: [], dynamic: [] };
let experiment = { running: false, requests: [], events: [] },
  worker,
  asset,
  server;
function child(file, options) {
  const p = fork(path.join(dir, file), [], options);
  children.add(p);
  p.once('exit', () => children.delete(p));
  return p;
}
function bounded(list, item, max = 500) {
  list.push(item);
  if (list.length > max) list.shift();
}
async function forward(kind, route, method = 'GET') {
  const response = await fetch(hosts[kind].url + '/__lab/' + route, {
    method,
    signal: AbortSignal.timeout(30000),
  });
  return { status: response.status, text: await response.text() };
}
(async () => {
  const root = dir;
  asset = http.createServer(async (req, res) => {
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
      res.writeHead(404);
      res.end();
    }
  });
  asset.listen(Number(process.env.SSR_CACHE_ASSET_PORT || 3066), '127.0.0.1');
  await once(asset, 'listening');
  const assetURL = 'http://127.0.0.1:' + asset.address().port;
  const selectedPackages = installed;
  const env = {
    ...process.env,
    SSR_CACHE_PACKAGES_ROOT: selectedPackages,
    SSR_CACHE_PRODUCTION_DIR: root,
    SSR_CACHE_ASSET_URL: assetURL,
    SSR_CACHE_RSPACK_ENTRY: await fs.realpath(r.resolve('@rspack/core')),
    NODE_OPTIONS:
      '--require=' +
      path.resolve(dir, '../../tools/ssr-cache/local-rspack-hook.cjs'),
  };
  const build = spawn(process.execPath, [path.join(dir, 'build.cjs')], {
    env,
    stdio: 'inherit',
  });
  children.add(build);
  build.once('exit', () => children.delete(build));
  const [code] = await once(build, 'exit');
  if (code !== 0) throw Error('Playground build failed: ' + code);
  for (const kind of ['static', 'dynamic']) {
    const p = child('host.cjs', {
      env: {
        ...process.env,
        SSR_CACHE_PACKAGES_ROOT: selectedPackages,
        LAB_ROOT: root,
        LAB_KIND: kind,
        LAB_ASSETS: assetURL,
      },
      execArgv: [
        ...(process.argv.includes('--memory') ||
        process.argv.includes('--debug') ||
        process.argv.includes('--test')
          ? ['--expose-gc']
          : []),
        ...(process.argv.includes('--debug')
          ? ['--inspect=' + (kind === 'static' ? 9230 : 9231)]
          : []),
      ],
      stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
    });
    hosts[kind] = await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(Error(kind + ' startup timeout')),
        60000,
      );
      p.once('message', (message) => {
        clearTimeout(timeout);
        resolve(message);
      });
      p.once('exit', (code) => {
        clearTimeout(timeout);
        reject(Error(kind + ' exited ' + code));
      });
    });
  }
  server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/api/state') {
        const states = {};
        for (const kind of Object.keys(hosts)) {
          const response = await forward(kind, 'status');
          states[kind] = { ...hosts[kind], ...JSON.parse(response.text) };
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ hosts: states, experiment, samples, root }));
        return;
      }
      if (url.pathname.startsWith('/api/')) {
        if (req.method !== 'POST') {
          res.writeHead(405);
          res.end('POST required');
          return;
        }
        const kind = url.searchParams.get('host') || 'static';
        if (!hosts[kind]) throw Error('Unknown host');
        const action = url.pathname.slice(5);
        if (action === 'page-ready') {
          const cycle = Number(url.searchParams.get('cycle'));
          if (
            !experiment.running ||
            !experiment.visual ||
            experiment.kind !== kind ||
            Number(url.searchParams.get('experimentId')) !==
              experiment.started ||
            !experiment.events.some(
              (e) => e.type === 'memory-cycle' && e.cycle === cycle,
            )
          ) {
            res.writeHead(409);
            res.end('No matching memory cycle');
            return;
          }
          worker.send({
            type: 'page-ready',
            cycle,
            experimentId: experiment.started,
          });
          res.end(JSON.stringify({ accepted: true }));
          return;
        }
        if (action === 'html') {
          const route = url.searchParams.get('entry') === '/b' ? '/b' : '/';
          const response = await fetch(hosts[kind].url + route);
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              status: response.status,
              html: await response.text(),
            }),
          );
          return;
        }
        if (action === 'experiment') {
          if (experiment.running) {
            res.writeHead(409);
            res.end('Experiment already running');
            return;
          }
          const preset = url.searchParams.get('preset') || 'auto';
          if (!['auto', 'manual', 'overflow', 'timeout'].includes(preset))
            throw Error('Unknown experiment preset');
          let count = Number(url.searchParams.get('count') || 12),
            interval = Number(url.searchParams.get('interval') || 0);
          const mode =
            url.searchParams.get('mode') === 'memory' ? 'memory' : 'traffic';
          if (
            !Number.isInteger(count) ||
            count < 1 ||
            count > 300 ||
            !Number.isFinite(interval) ||
            interval < 0 ||
            interval > 100
          )
            throw Error('Invalid experiment limits');
          if (mode === 'traffic' && preset !== 'manual') {
            count = preset === 'overflow' ? 32 : 12;
            interval = 0;
          }
          const visual =
            mode === 'memory' && url.searchParams.get('visual') === '1';
          experiment = {
            visual,
            total: count,
            preset,
            running: true,
            kind,
            mode,
            started: Date.now(),
            requests: [],
            events: [],
          };
          const args = {
            visual,
            experimentId: experiment.started,
            preset,
            url: hosts[kind].url,
            mode,
            count,
            interval,
            version: url.searchParams.get('v') === 'v1' ? 'v1' : 'v2',
          };
          worker = fork(path.join(dir, 'traffic.cjs'), [JSON.stringify(args)], {
            stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
          });
          children.add(worker);
          worker.on('message', (message) => {
            if (message.type === 'request') {
              const previous = experiment.requests.find(
                (r) => r.id === message.id,
              );
              if (previous) Object.assign(previous, message);
              else bounded(experiment.requests, message);
            } else if (message.type === 'sample')
              bounded(samples[kind], {
                ...message.sample,
                cycle: message.cycle,
              });
            else bounded(experiment.events, message);
          });
          worker.once('exit', (code) => {
            children.delete(worker);
            experiment.running = false;
            experiment.exitCode = code;
          });
          res.end(
            JSON.stringify({ started: true, experimentId: experiment.started }),
          );
          return;
        }
        if (!['update', 'release', 'sample', 'snapshot'].includes(action)) {
          res.writeHead(404);
          res.end();
          return;
        }
        if (experiment.running && action !== 'release') {
          res.writeHead(409);
          res.end('Wait for the current experiment');
          return;
        }
        const query = new URLSearchParams(url.search);
        query.delete('host');
        const response = await forward(
          kind,
          action + '?' + query.toString(),
          'POST',
        );
        if (action === 'sample' && response.status === 200)
          bounded(samples[kind], JSON.parse(response.text));
        res.writeHead(response.status, { 'Content-Type': 'application/json' });
        res.end(response.text);
        return;
      }
      res.writeHead(404);
      res.end('Control API only');
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: String(e) }));
    }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const ui = child('console-server.cjs', {
    env: {
      ...env,
      LAB_ROOT: root,
      LAB_API: 'http://127.0.0.1:' + server.address().port,
    },
    stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
  });
  const consoleURL = await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(Error('Modern console startup timeout')),
      60000,
    );
    ui.once('message', (m) => {
      clearTimeout(timer);
      resolve(m.url);
    });
    ui.once('exit', (code) => {
      clearTimeout(timer);
      reject(Error('Modern console exited ' + code));
    });
  });
  console.log(
    'PLAYGROUND_READY',
    JSON.stringify({
      url: consoleURL,
      hosts,
      root,
    }),
  );
  process.send?.({
    ready: true,
    url: consoleURL,
    hosts,
    root,
  });
})().catch((e) => {
  console.error(e);
  stop(1);
});
let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  worker?.kill('SIGTERM');
  for (const p of children) p.kill('SIGTERM');
  server?.closeAllConnections();
  asset?.closeAllConnections();
  server?.close();
  asset?.close();
  setTimeout(() => {
    for (const p of children) p.kill('SIGKILL');
    process.exit(code);
  }, 2000).unref();
}
process.once('SIGINT', () => stop());
process.once('SIGTERM', () => stop());
if (process.send) process.once('disconnect', () => stop());
