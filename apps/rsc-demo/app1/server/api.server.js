/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

/**
 * Express Server for RSC Application
 *
 * This server uses BUNDLED RSC code from webpack.
 * The webpack build uses resolve.conditionNames: ['react-server', ...]
 * to resolve React packages at BUILD time.
 *
 * NO --conditions=react-server flag needed at runtime!
 */

const express = require('express');
const compress = require('compression');
const Busboy = require('busboy');
const { readFileSync, existsSync } = require('fs');
const { unlink, writeFile, mkdir } = require('fs').promises;
const { PassThrough } = require('stream');
const path = require('path');
const rscRuntime = require('@module-federation/rsc/runtime/rscRuntimePlugin.js');

const resolveRemoteAction =
  rscRuntime && typeof rscRuntime.resolveRemoteAction === 'function'
    ? rscRuntime.resolveRemoteAction
    : null;
const getFederationInstance =
  rscRuntime && typeof rscRuntime.getFederationInstance === 'function'
    ? rscRuntime.getFederationInstance
    : null;
const parseRemoteActionId =
  rscRuntime && typeof rscRuntime.parseRemoteActionId === 'function'
    ? rscRuntime.parseRemoteActionId
    : null;
const getIndexedRemoteAction =
  rscRuntime && typeof rscRuntime.getIndexedRemoteAction === 'function'
    ? rscRuntime.getIndexedRemoteAction
    : null;
const ensureRemoteActionsForAction =
  rscRuntime && typeof rscRuntime.ensureRemoteActionsForAction === 'function'
    ? rscRuntime.ensureRemoteActionsForAction
    : null;

const ACTION_HEADER = 'next-action';
const ACTION_HEADER_FALLBACK = 'rsc-action';
const ROUTER_STATE_HEADER = 'next-router-state-tree';
const RSC_VARY_HEADER_VALUE =
  'RSC, Next-Action, Next-Router-State-Tree, Accept';
// Debug headers for E2E assertions about action execution path.
const RSC_FEDERATION_ACTION_MODE_HEADER = 'x-federation-action-mode';
const RSC_FEDERATION_ACTION_REMOTE_HEADER = 'x-federation-action-remote';

function getActionId(req) {
  if (!req || typeof req.get !== 'function') return null;
  return req.get(ACTION_HEADER) || req.get(ACTION_HEADER_FALLBACK) || null;
}

// Host app runs on 4101 by default (tests assume this)
const PORT = process.env.PORT || 4101;
// Used by server components to resolve same-origin API fetches.
if (!process.env.RSC_API_ORIGIN) {
  process.env.RSC_API_ORIGIN = `http://localhost:${PORT}`;
}
// Remote app (app2) base URL for MF client remotes consumed during SSR.
if (!process.env.APP2_BASE_URL) {
  process.env.APP2_BASE_URL = 'http://localhost:4102';
}

/**
 * Resolve remote action ownership by manifest data (Option 1 fallback).
 *
 * Explicit remote prefixes (remote:<name>:) are always honored; otherwise the
 * action is matched against remote server-actions manifests declared in
 * mf-manifest additionalData.rsc.
 */
async function getRemoteAction(actionId) {
  if (!resolveRemoteAction || !getFederationInstance) return null;
  const federationInstance = getFederationInstance('app1');
  if (!federationInstance) return null;

  // If the action is explicitly prefixed, resolve even if the local manifest
  // includes the ID. Otherwise, only resolve when needed.
  return resolveRemoteAction(actionId, federationInstance);
}

/**
 * Forward a server action request to a remote app (Option 1)
 * Proxies the full request/response to preserve RSC Flight protocol
 */
function buildRemoteActionUrl(actionsEndpoint) {
  if (typeof actionsEndpoint !== 'string' || actionsEndpoint.length === 0) {
    return null;
  }

  // Security: do not derive the remote URL from user-provided request data.
  // Only forward to the configured remote actions endpoint.
  try {
    const url = new URL(actionsEndpoint);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    // Demo hardening: only allow forwarding to local remotes. This prevents
    // SSRF even if a remote manifest/config is tampered with.
    // (Intentionally not configurable for now.)
    const host = url.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1' && host !== '::1') {
      return null;
    }
    url.search = '';
    return url.href;
  } catch (_e) {
    return null;
  }
}

async function forwardActionToRemote(
  req,
  res,
  forwardedActionId,
  remoteName,
  actionsEndpoint,
  actionHeader,
) {
  const targetUrl = buildRemoteActionUrl(actionsEndpoint);

  if (!targetUrl) {
    res.status(502).send('Missing remote actions endpoint for forwarding');
    return;
  }

  // Log federation forwarding (use %s to avoid format string injection)
  console.log(
    '[Federation] Forwarding action %s to %s',
    forwardedActionId,
    targetUrl,
  );

  res.set(RSC_FEDERATION_ACTION_MODE_HEADER, 'proxy');
  if (remoteName) {
    res.set(RSC_FEDERATION_ACTION_REMOTE_HEADER, remoteName);
  }

  // Collect request body
  const bodyChunks = [];
  req.on('data', (chunk) => bodyChunks.push(chunk));

  await new Promise((resolve, reject) => {
    req.on('end', resolve);
    req.on('error', reject);
  });

  const bodyBuffer = Buffer.concat(bodyChunks);

  // Start from original headers so we preserve cookies/auth/etc.
  const headers = { ...req.headers };

  // Never forward host/header values directly; let fetch set Host.
  delete headers.host;
  delete headers.connection;
  delete headers['content-length'];

  // Force action headers to the ID the remote expects. Send both headers
  // during migration to keep mixed versions interoperable.
  const preferredActionHeader =
    typeof actionHeader === 'string' && actionHeader.length > 0
      ? actionHeader.toLowerCase()
      : ACTION_HEADER;
  headers[preferredActionHeader] = forwardedActionId;
  headers[ACTION_HEADER] = forwardedActionId;
  headers[ACTION_HEADER_FALLBACK] = forwardedActionId;

  // Ensure content-type is present if we have a body.
  if (
    bodyBuffer.length &&
    !headers['content-type'] &&
    !headers['Content-Type']
  ) {
    headers['content-type'] = 'application/octet-stream';
  }

  // Forward to remote app
  const response = await fetch(targetUrl, {
    method: 'POST',
    headers,
    body: bodyBuffer,
  });

  // Copy response headers (with null check for headers object)
  if (response.headers && typeof response.headers.entries === 'function') {
    for (const [key, value] of response.headers.entries()) {
      // Skip some headers that shouldn't be forwarded
      if (
        !['content-encoding', 'transfer-encoding', 'connection'].includes(
          key.toLowerCase(),
        )
      ) {
        res.set(key, value);
      }
    }
  }

  res.status(response.status);

  // Get full response body and write it (more reliable than streaming with getReader)
  // This works better with test frameworks like supertest
  const body = await response.text();
  if (body) {
    res.write(body);
  }
  res.end();
}

// Database will be loaded from bundled RSC server
// This is lazy-loaded to allow the bundle to be loaded first
let pool = null;
const app = express();

app.use(compress());
const buildDir = path.resolve(__dirname, '../build');
app.use(express.static(buildDir, { index: false }));
app.use('/build', express.static(buildDir));
app.use(express.static(path.resolve(__dirname, '../public'), { index: false }));

// Lazy-load the bundled RSC server code
// This is built by webpack with react-server condition resolved at build time
// With asyncStartup: true, the require returns a promise that resolves to the module
let rscServerPromise = null;
let rscServerResolved = null;
let clientManifestCache = null;
let ssrBundlePromise = null;
let ssrBundleResolved = null;

const SSR_MAX_CONCURRENCY = Math.max(
  1,
  Number(process.env.RSC_SSR_MAX_CONCURRENCY) || 4,
);
const SSR_TIMEOUT_MS = Number(process.env.RSC_SSR_TIMEOUT_MS) || 30000;
let ssrInFlight = 0;
const ssrQueue = [];

function withSsrSlot(task) {
  return new Promise((resolve, reject) => {
    const run = () => {
      ssrInFlight += 1;
      task()
        .then(resolve, reject)
        .finally(() => {
          ssrInFlight -= 1;
          const next = ssrQueue.shift();
          if (next) next();
        });
    };

    if (ssrInFlight < SSR_MAX_CONCURRENCY) {
      run();
      return;
    }

    ssrQueue.push(run);
  });
}

function getClientManifest() {
  if (clientManifestCache) return clientManifestCache;
  const manifest = readFileSync(
    path.resolve(__dirname, '../build/react-client-manifest.json'),
    'utf8',
  );
  clientManifestCache = JSON.parse(manifest);
  return clientManifestCache;
}

async function getRSCServer() {
  if (rscServerResolved) {
    return rscServerResolved;
  }
  if (!rscServerPromise) {
    const bundlePath = path.resolve(__dirname, '../build/server.rsc.js');
    if (!existsSync(bundlePath)) {
      throw new Error(
        'RSC server bundle not found. Run `pnpm build` first.\n' +
          'The server bundle is built with webpack and includes React with react-server exports.',
      );
    }
    const mod = require(bundlePath);
    // With asyncStartup, the module might be a promise or have async init
    rscServerPromise = Promise.resolve(mod).then((resolved) => {
      rscServerResolved = resolved;
      return resolved;
    });
  }
  return rscServerPromise;
}

async function getSSRBundle() {
  if (ssrBundleResolved) {
    return ssrBundleResolved;
  }
  if (!ssrBundlePromise) {
    const bundlePath = path.resolve(__dirname, '../build/ssr.js');
    if (!existsSync(bundlePath)) {
      throw new Error(
        'SSR bundle not found. Run `pnpm build` first.\n' +
          'The SSR bundle is built by webpack and used to render Flight to HTML.',
      );
    }
    const mod = require(bundlePath);
    ssrBundlePromise = Promise.resolve(mod).then((resolved) => {
      ssrBundleResolved = resolved;
      return resolved;
    });
  }
  return ssrBundlePromise;
}

async function ensureRemoteActionsRegistered(actionId) {
  if (!actionId) return null;
  if (!ensureRemoteActionsForAction || !getFederationInstance) return null;

  const federationInstance = getFederationInstance('app1');
  if (!federationInstance) return null;

  try {
    return await ensureRemoteActionsForAction(actionId, federationInstance);
  } catch (error) {
    // MF-native registration is best-effort; failures should fall back to
    // HTTP forwarding (Option 1) instead of crashing the host server.
    console.warn(
      '[Federation] MF-native action registration failed; falling back to HTTP forwarding:',
      error && error.message ? error.message : error,
    );
    return null;
  }
}

async function getPool() {
  if (!pool) {
    const server = await getRSCServer();
    pool = server.pool;
  }
  return pool;
}

if (!process.env.RSC_TEST_MODE) {
  app
    .listen(PORT, () => {
      console.log(`React Notes listening at ${PORT}...`);
      console.log('Using bundled RSC server (no --conditions flag needed)');
    })
    .on('error', function (error) {
      if (error.syscall !== 'listen') {
        throw error;
      }
      const isPipe = (portOrPipe) => Number.isNaN(portOrPipe);
      const bind = isPipe(PORT) ? 'Pipe ' + PORT : 'Port ' + PORT;
      switch (error.code) {
        case 'EACCES':
          console.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(bind + ' is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
}

function handleErrors(fn) {
  return async function (req, res, next) {
    try {
      return await fn(req, res);
    } catch (x) {
      next(x);
    }
  };
}

async function readRequestBody(req) {
  if (req.body && typeof req.body === 'string') {
    return req.body;
  }
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return JSON.stringify(req.body);
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/**
 * Render RSC to a buffer (flight stream)
 * Uses the bundled RSC server code (webpack-built with react-server condition)
 */
async function renderRSCToBuffer(props) {
  const moduleMap = getClientManifest();

  // Use bundled RSC server (await for asyncStartup)
  const server = await getRSCServer();

  return new Promise((resolve, reject) => {
    const chunks = [];
    const passThrough = new PassThrough();
    passThrough.on('data', (chunk) => chunks.push(chunk));
    passThrough.on('end', () => resolve(Buffer.concat(chunks)));
    passThrough.on('error', reject);

    const { pipe } = server.renderApp(props, moduleMap);
    pipe(passThrough);
  });
}

/**
 * Render RSC flight stream to HTML using SSR worker
 * Uses the bundled SSR code cached in-process to avoid per-request process spawn.
 */
function renderSSR(rscBuffer) {
  return withSsrSlot(async () => {
    const ssrBundle = await getSSRBundle();
    let timeoutId;
    try {
      const renderPromise = Promise.resolve(
        ssrBundle.renderFlightToHTML(rscBuffer, getClientManifest()),
      );
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(
          () =>
            reject(new Error(`SSR render timed out after ${SSR_TIMEOUT_MS}ms`)),
          SSR_TIMEOUT_MS,
        );
      });
      return await Promise.race([renderPromise, timeoutPromise]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  });
}

app.get(
  '/',
  handleErrors(async function (_req, res) {
    await waitForWebpack();

    const props = {
      selectedId: null,
      isEditing: false,
      searchText: '',
    };

    // SSR is expected to work in this demo. Fail fast instead of rendering a
    // shell-only fallback, so missing SSR outputs are immediately actionable.
    const ssrBundlePath = path.resolve(__dirname, '../build/ssr.js');
    if (!existsSync(ssrBundlePath)) {
      throw new Error(
        `Missing SSR bundle at ${ssrBundlePath}. Run the app build before starting the server.`,
      );
    }

    // Step 1: Render RSC to flight stream (using bundled RSC server)
    const rscBuffer = await renderRSCToBuffer(props);

    // Step 2: Render flight stream to HTML using SSR worker (using bundled SSR code)
    const ssrHtml = await renderSSR(rscBuffer);

    // Step 3: Inject SSR HTML into the shell template
    const shellHtml = readFileSync(
      path.resolve(__dirname, '../build/index.html'),
      'utf8',
    );

    // Embed the RSC flight data for hydration
    const rscDataScript = `<script id="__RSC_DATA__" type="application/json">${JSON.stringify(
      rscBuffer.toString('utf8'),
    ).replace(/</g, '\\u003c')}</script>`;

    // Replace the empty root div with SSR content + RSC data
    const finalHtml = shellHtml.replace(
      '<div id="root"></div>',
      `<div id="root">${ssrHtml}</div>${rscDataScript}`,
    );

    res.send(finalHtml);
  }),
);

async function renderReactTree(res, props) {
  await waitForWebpack();
  const moduleMap = getClientManifest();

  // Use bundled RSC server (await for asyncStartup)
  const server = await getRSCServer();
  const { pipe } = server.renderApp(props, moduleMap);
  pipe(res);
}

function parseLocationValue(rawLocation, res) {
  try {
    const parsed = JSON.parse(rawLocation);
    if (!parsed || typeof parsed !== 'object') {
      res.status(400).type('text/plain').send('Invalid location query.');
      return null;
    }
    return parsed;
  } catch (_e) {
    res.status(400).type('text/plain').send('Invalid location query.');
    return null;
  }
}

function parseLocationParam(req, res) {
  const routerStateHeader =
    req && typeof req.get === 'function' ? req.get(ROUTER_STATE_HEADER) : null;
  if (typeof routerStateHeader === 'string' && routerStateHeader.length > 0) {
    return parseLocationValue(routerStateHeader, res);
  }

  if (req.query && typeof req.query.location === 'string') {
    return parseLocationValue(req.query.location, res);
  }

  return {
    selectedId: null,
    isEditing: false,
    searchText: '',
  };
}

function setRscVaryHeader(res) {
  const existing =
    (typeof res.get === 'function' && res.get('Vary')) ||
    (typeof res.getHeader === 'function' && res.getHeader('Vary')) ||
    '';
  const varyValues = new Set(
    String(existing)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  );
  for (const value of RSC_VARY_HEADER_VALUE.split(',')) {
    const normalized = value.trim();
    if (normalized) varyValues.add(normalized);
  }
  res.set('Vary', Array.from(varyValues).join(', '));
}

function sendResponse(req, res, redirectToId) {
  const location = parseLocationParam(req, res);
  if (!location) return;
  if (redirectToId) {
    location.selectedId = redirectToId;
  }
  setRscVaryHeader(res);
  res.set('X-Location', JSON.stringify(location));
  renderReactTree(res, {
    selectedId: location.selectedId,
    isEditing: location.isEditing,
    searchText: location.searchText,
  });
}

app.get('/react', function (req, res) {
  sendResponse(req, res, null);
});

// Server Actions endpoint - spec-compliant implementation
// Uses the primary action header with a compatibility fallback.
//
// FEDERATED ACTIONS:
// - Option 2 (preferred): In-process MF-native actions. Remote 'use server'
//   modules are imported via Module Federation in server-entry.js and
//   registered into the shared serverActionRegistry. getServerAction(id)
//   returns a callable function that runs in this process.
// - Option 1 (fallback): HTTP forwarding. If an action ID belongs to a remote
//   manifest (or is explicitly prefixed) but is not registered via MF, the
//   request is forwarded to the remote /react endpoint and proxied back.
app.post(
  '/react',
  handleErrors(async function (req, res) {
    const actionId = getActionId(req);

    if (!actionId) {
      res.status(400).type('text/plain').send('Missing action header');
      return;
    }
    setRscVaryHeader(res);

    await waitForWebpack();

    // Get the bundled RSC server (await for asyncStartup)
    const server = await getRSCServer();

    // Option 2 (default): if the action isn't already registered locally,
    // attempt MF-native remote registration and retry lookup.
    let actionFn = server.getServerAction(actionId);
    if (typeof actionFn !== 'function') {
      await ensureRemoteActionsRegistered(actionId);
      actionFn = server.getServerAction(actionId);
    }

    // Load server actions manifest from build
    const manifestPath = path.resolve(
      __dirname,
      '../build/react-server-actions-manifest.json',
    );
    let serverActionsManifest = {};
    if (existsSync(manifestPath)) {
      serverActionsManifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    }

    // Merge dynamic inline actions registered at runtime
    const dynamicManifest = server.getDynamicServerActionsManifest() || {};
    serverActionsManifest = Object.assign(
      {},
      serverActionsManifest,
      dynamicManifest,
    );

    const actionEntry = serverActionsManifest[actionId];

    const explicitRemote = parseRemoteActionId
      ? parseRemoteActionId(actionId)
      : null;

    // For MF-native execution we still want to attribute the action to its
    // remote, even if the ID exists in the merged server actions manifest.
    let remoteAction = getIndexedRemoteAction
      ? getIndexedRemoteAction(actionId)
      : null;
    if (!remoteAction && (explicitRemote || !actionEntry)) {
      remoteAction = await getRemoteAction(actionId);
    }

    // If MF-native registration did not provide a function, fall back to
    // Option 1 (HTTP forwarding) for known remote actions.
    if (!actionFn) {
      if (remoteAction) {
        // Use %s to avoid format string injection
        console.log(
          '[Federation] Action %s belongs to %s, no MF-registered handler found, forwarding via HTTP...',
          actionId,
          remoteAction.remoteName,
        );
        await forwardActionToRemote(
          req,
          res,
          remoteAction.forwardedId,
          remoteAction.remoteName,
          remoteAction.actionsEndpoint,
          remoteAction.actionHeader,
        );
        return;
      }
    }

    if (!actionFn && actionEntry) {
      // For bundled server actions, they should be in the registry
      // File-level actions are also bundled into server.rsc.js
      // Use %s to avoid format string injection
      console.warn(
        'Action %s not in registry, manifest entry:',
        actionId,
        actionEntry,
      );
    }

    if (typeof actionFn !== 'function') {
      res
        .status(404)
        .type('text/plain')
        .send(
          `Server action "${actionId}" not found. ` +
            `Ensure the module is bundled in the RSC server build and begins with 'use server'.`,
        );
      return;
    }

    // Decode the action arguments using React's Flight Reply protocol
    const contentType = req.headers['content-type'] || '';
    let args;
    if (contentType.startsWith('multipart/form-data')) {
      const busboy = new Busboy({ headers: req.headers });
      const pending = server.decodeReplyFromBusboy(
        busboy,
        serverActionsManifest,
      );
      req.pipe(busboy);
      args = await pending;
    } else {
      const body = await readRequestBody(req);
      args = await server.decodeReply(body, serverActionsManifest);
    }

    // Execute the server action
    const result = await actionFn(...(Array.isArray(args) ? args : [args]));

    // Return the result as RSC Flight stream
    res.set('Content-Type', 'text/x-component');
    if (remoteAction) {
      res.set(RSC_FEDERATION_ACTION_MODE_HEADER, 'mf');
      res.set(RSC_FEDERATION_ACTION_REMOTE_HEADER, remoteAction.remoteName);
    }

    // For now, re-render the app tree with the action result
    const location = parseLocationParam(req, res);
    if (!location) return;

    // Include action result in response header for client consumption
    if (result !== undefined) {
      res.set('X-Action-Result', JSON.stringify(result));
    }

    renderReactTree(res, {
      selectedId: location.selectedId,
      isEditing: location.isEditing,
      searchText: location.searchText,
    });
  }),
);

const NOTES_PATH = path.resolve(__dirname, '../notes');

async function ensureNotesDir() {
  await mkdir(NOTES_PATH, { recursive: true });
}

async function safeUnlink(filePath) {
  try {
    await unlink(filePath);
  } catch (error) {
    if (error && error.code === 'ENOENT') return;
    throw error;
  }
}

app.post(
  '/notes',
  express.json(),
  handleErrors(async function (req, res) {
    const now = new Date();
    const pool = await getPool();
    const result = await pool.query(
      'insert into notes (title, body, created_at, updated_at) values ($1, $2, $3, $3) returning id',
      [req.body.title, req.body.body, now],
    );
    const insertedId = result.rows[0].id;
    await ensureNotesDir();
    await writeFile(
      path.resolve(NOTES_PATH, `${insertedId}.md`),
      req.body.body,
      'utf8',
    );
    sendResponse(req, res, insertedId);
  }),
);

app.put(
  '/notes/:id',
  express.json(),
  handleErrors(async function (req, res) {
    const now = new Date();
    const updatedId = Number(req.params.id);
    // Validate ID is a positive integer to prevent path traversal
    if (!Number.isInteger(updatedId) || updatedId <= 0) {
      res.status(400).send('Invalid note ID');
      return;
    }
    const pool = await getPool();
    await pool.query(
      'update notes set title = $1, body = $2, updated_at = $3 where id = $4',
      [req.body.title, req.body.body, now, updatedId],
    );
    await ensureNotesDir();
    await writeFile(
      path.resolve(NOTES_PATH, `${updatedId}.md`),
      req.body.body,
      'utf8',
    );
    sendResponse(req, res, null);
  }),
);

app.delete(
  '/notes/:id',
  handleErrors(async function (req, res) {
    const noteId = Number(req.params.id);
    // Validate ID is a positive integer to prevent path traversal
    if (!Number.isInteger(noteId) || noteId <= 0) {
      res.status(400).send('Invalid note ID');
      return;
    }
    const pool = await getPool();
    await pool.query('delete from notes where id = $1', [noteId]);
    await safeUnlink(path.resolve(NOTES_PATH, `${noteId}.md`));
    sendResponse(req, res, null);
  }),
);

app.get(
  '/notes',
  handleErrors(async function (_req, res) {
    const pool = await getPool();
    const { rows } = await pool.query('select * from notes order by id desc');
    res.json(rows);
  }),
);

app.get(
  '/notes/:id',
  handleErrors(async function (req, res) {
    const noteId = Number(req.params.id);
    // Validate ID is a positive integer
    if (!Number.isInteger(noteId) || noteId <= 0) {
      res.status(400).send('Invalid note ID');
      return;
    }
    const pool = await getPool();
    const { rows } = await pool.query('select * from notes where id = $1', [
      noteId,
    ]);
    res.json(rows[0]);
  }),
);

app.get('/sleep/:ms', function (req, res) {
  // Use allowlist of fixed durations to prevent resource exhaustion (CodeQL security)
  // This avoids user-controlled timer values entirely
  const ALLOWED_SLEEP_MS = [0, 100, 500, 1000, 2000, 5000, 10000];
  const requested = parseInt(req.params.ms, 10);
  // Find the closest allowed value that doesn't exceed the request
  const sleepMs = ALLOWED_SLEEP_MS.reduce((closest, allowed) => {
    if (allowed <= requested && allowed > closest) return allowed;
    return closest;
  }, 0);
  setTimeout(() => {
    res.json({ ok: true, actualSleep: sleepMs });
  }, sleepMs);
});

app.use(express.static('build', { index: false }));
app.use(express.static('public', { index: false }));

async function waitForWebpack() {
  const requiredFiles = [
    path.resolve(__dirname, '../build/index.html'),
    path.resolve(__dirname, '../build/server.rsc.js'),
    path.resolve(__dirname, '../build/react-client-manifest.json'),
  ];

  // In test mode we don't want to loop forever; just assert once.
  const isTest = !!process.env.RSC_TEST_MODE;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const missing = requiredFiles.filter((file) => !existsSync(file));
    if (missing.length === 0) {
      return;
    }

    const msg =
      'Could not find webpack build output: ' +
      missing.map((f) => path.basename(f)).join(', ') +
      '. Will retry in a second...';
    console.log(msg);

    if (isTest) {
      // In tests, fail fast instead of looping forever.
      throw new Error(msg);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

module.exports = app;
