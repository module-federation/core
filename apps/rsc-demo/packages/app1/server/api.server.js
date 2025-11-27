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
const {readFileSync, existsSync} = require('fs');
const {unlink, writeFile} = require('fs').promises;
const {spawn} = require('child_process');
const {PassThrough} = require('stream');
const path = require('path');
const React = require('react');

// RSC Action header (similar to Next.js's 'Next-Action')
const RSC_ACTION_HEADER = 'rsc-action';

// Host app runs on 4101 by default (tests assume this)
const PORT = process.env.PORT || 4101;

// Remote app configuration for federated server actions (Option 1 - HTTP forwarding)
// Action IDs prefixed with 'remote:app2:' or containing 'app2/' are forwarded to app2
const REMOTE_APP_CONFIG = {
  app2: {
    url: process.env.APP2_URL || 'http://localhost:4102',
    // Patterns to match action IDs that belong to app2
    patterns: [
      /^remote:app2:/, // Explicit prefix
      /app2\/src\//, // File path contains app2
      /packages\/app2\//, // Full package path
    ],
  },
};

/**
 * Check if an action ID belongs to a remote app and compute the ID that the
 * remote server should see.
 *
 * For example, an ID like `remote:app2:file:///...#increment` should be
 * forwarded as `file:///...#increment` so it matches the remote manifest keys.
 *
 * @param {string} actionId - The (possibly prefixed) server action ID
 * @returns {{ app: string, config: object, forwardedId: string } | null}
 *
 * TODO (Option 2 - Deep MF Integration):
 * Instead of HTTP forwarding, remote actions could be executed via MF:
 * 1. Import remote action modules via MF in server-entry.js
 * 2. Remote 'use server' functions register with host's serverActionRegistry
 * 3. getServerAction(actionId) returns federated functions directly
 * This requires changes to:
 *   - rsc-server-loader.js to handle remote module registration
 *   - react-server-dom-webpack-plugin.js to include remote actions in manifest
 *   - server.node.js to support federated action lookups
 * Remote manifests (react-server-actions-manifest.json) would then be merged
 * into the host's manifest instead of being consulted via HTTP.
 */
function getRemoteAppForAction(actionId) {
  for (const [app, config] of Object.entries(REMOTE_APP_CONFIG)) {
    for (const pattern of config.patterns) {
      if (pattern.test(actionId)) {
        // Strip explicit remote prefix if present so the remote sees the
        // original manifest ID (e.g. file:///...#name).
        let forwardedId = actionId;
        const prefix = `remote:${app}:`;
        if (forwardedId.startsWith(prefix)) {
          forwardedId = forwardedId.slice(prefix.length);
        }
        return {app, config, forwardedId};
      }
    }
  }
  return null;
}

/**
 * Forward a server action request to a remote app (Option 1)
 * Proxies the full request/response to preserve RSC Flight protocol
 */
async function forwardActionToRemote(
  req,
  res,
  forwardedActionId,
  remoteConfig
) {
  const targetUrl = `${remoteConfig.url}/react${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;

  console.log(
    `[Federation] Forwarding action ${forwardedActionId} to ${targetUrl}`
  );

  // Collect request body
  const bodyChunks = [];
  req.on('data', (chunk) => bodyChunks.push(chunk));

  await new Promise((resolve, reject) => {
    req.on('end', resolve);
    req.on('error', reject);
  });

  const bodyBuffer = Buffer.concat(bodyChunks);

  // Start from original headers so we preserve cookies/auth/etc.
  const headers = {...req.headers};

  // Never forward host/header values directly; let fetch set Host.
  delete headers.host;
  delete headers.connection;
  delete headers['content-length'];

  // Force the action header to the ID the remote expects.
  headers[RSC_ACTION_HEADER] = forwardedActionId;

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

  // Copy response headers
  for (const [key, value] of response.headers.entries()) {
    // Skip some headers that shouldn't be forwarded
    if (
      !['content-encoding', 'transfer-encoding', 'connection'].includes(
        key.toLowerCase()
      )
    ) {
      res.set(key, value);
    }
  }

  res.status(response.status);

  // Stream response body
  if (response.body) {
    const reader = response.body.getReader();
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      res.write(value);
    }
  }
  res.end();
}

// Database will be loaded from bundled RSC server
// This is lazy-loaded to allow the bundle to be loaded first
let pool = null;
const app = express();

app.use(compress());
const buildDir = path.resolve(__dirname, '../build');
app.use(express.static(buildDir));
app.use('/build', express.static(buildDir));
app.use(express.static(path.resolve(__dirname, '../public')));

// Lazy-load the bundled RSC server code
// This is built by webpack with react-server condition resolved at build time
// With asyncStartup: true, the require returns a promise that resolves to the module
let rscServerPromise = null;
let rscServerResolved = null;
let remoteActionsInitPromise = null;

async function getRSCServer() {
  if (rscServerResolved) {
    return rscServerResolved;
  }
  if (!rscServerPromise) {
    const bundlePath = path.resolve(__dirname, '../build/server.rsc.js');
    if (!existsSync(bundlePath)) {
      throw new Error(
        'RSC server bundle not found. Run `pnpm build` first.\n' +
          'The server bundle is built with webpack and includes React with react-server exports.'
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

async function ensureRemoteActionsRegistered(server) {
  // Option 2: In-process MF-native federated actions.
  // If the RSC server exposes registerRemoteApp2Actions, call it once to
  // register remote actions into the shared serverActionRegistry. We guard
  // with a promise so multiple /react requests don't re-register.
  if (!server || typeof server.registerRemoteApp2Actions !== 'function') {
    return;
  }
  if (!remoteActionsInitPromise) {
    remoteActionsInitPromise = Promise.resolve().then(async () => {
      try {
        await server.registerRemoteApp2Actions();
      } catch (error) {
        console.error(
          '[Federation] Failed to register remote actions via Module Federation:',
          error
        );
        // Allow a future attempt if registration fails.
        remoteActionsInitPromise = null;
      }
    });
  }
  return remoteActionsInitPromise;
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
  const manifest = readFileSync(
    path.resolve(__dirname, '../build/react-client-manifest.json'),
    'utf8'
  );
  const moduleMap = JSON.parse(manifest);

  // Use bundled RSC server (await for asyncStartup)
  const server = await getRSCServer();

  return new Promise((resolve, reject) => {
    const chunks = [];
    const passThrough = new PassThrough();
    passThrough.on('data', (chunk) => chunks.push(chunk));
    passThrough.on('end', () => resolve(Buffer.concat(chunks)));
    passThrough.on('error', reject);

    const {pipe} = server.renderApp(props, moduleMap);
    pipe(passThrough);
  });
}

/**
 * Render RSC flight stream to HTML using SSR worker
 * The SSR worker uses the bundled SSR code (webpack-built without react-server condition)
 */
function renderSSR(rscBuffer) {
  return new Promise((resolve, reject) => {
    const workerPath = path.resolve(__dirname, './ssr-worker.js');
    const ssrWorker = spawn('node', [workerPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {...process.env},
    });

    const chunks = [];
    ssrWorker.stdout.on('data', (chunk) => chunks.push(chunk));
    ssrWorker.stdout.on('end', () =>
      resolve(Buffer.concat(chunks).toString('utf8'))
    );

    ssrWorker.stderr.on('data', (data) => {
      console.error('SSR Worker stderr:', data.toString());
    });

    ssrWorker.on('error', reject);
    ssrWorker.on('close', (code) => {
      if (code !== 0 && chunks.length === 0) {
        reject(new Error(`SSR worker exited with code ${code}`));
      }
    });

    // Send RSC flight data to worker
    ssrWorker.stdin.write(rscBuffer);
    ssrWorker.stdin.end();
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

    // Check if SSR bundle exists
    const ssrBundlePath = path.resolve(__dirname, '../build/ssr.js');
    if (!existsSync(ssrBundlePath)) {
      // Fallback to shell if SSR bundle not built
      const html = readFileSync(
        path.resolve(__dirname, '../build/index.html'),
        'utf8'
      );
      res.send(html);
      return;
    }

    try {
      // Step 1: Render RSC to flight stream (using bundled RSC server)
      const rscBuffer = await renderRSCToBuffer(props);

      // Step 2: Render flight stream to HTML using SSR worker (using bundled SSR code)
      const ssrHtml = await renderSSR(rscBuffer);

      // Step 3: Inject SSR HTML into the shell template
      const shellHtml = readFileSync(
        path.resolve(__dirname, '../build/index.html'),
        'utf8'
      );

      // Embed the RSC flight data for hydration
      const rscDataScript = `<script id="__RSC_DATA__" type="application/json">${JSON.stringify(rscBuffer.toString('utf8'))}</script>`;

      // Replace the empty root div with SSR content + RSC data
      const finalHtml = shellHtml.replace(
        '<div id="root"></div>',
        `<div id="root">${ssrHtml}</div>${rscDataScript}`
      );

      res.send(finalHtml);
    } catch (error) {
      console.error('SSR Error, falling back to shell:', error);
      // Fallback to shell rendering on error
      const html = readFileSync(
        path.resolve(__dirname, '../build/index.html'),
        'utf8'
      );
      res.send(html);
    }
  })
);

async function renderReactTree(res, props) {
  await waitForWebpack();
  const manifest = readFileSync(
    path.resolve(__dirname, '../build/react-client-manifest.json'),
    'utf8'
  );
  const moduleMap = JSON.parse(manifest);

  // Use bundled RSC server (await for asyncStartup)
  const server = await getRSCServer();
  const {pipe} = server.renderApp(props, moduleMap);
  pipe(res);
}

function sendResponse(req, res, redirectToId) {
  const location = JSON.parse(req.query.location);
  if (redirectToId) {
    location.selectedId = redirectToId;
  }
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
// Uses RSC-Action header to identify action (like Next.js's Next-Action)
//
// FEDERATED ACTIONS:
// - Option 2 (preferred): In-process MF-native actions. Remote 'use server'
//   modules from app2 are imported via Module Federation in server-entry.js
//   and registered into the shared serverActionRegistry. getServerAction(id)
//   returns a callable function that runs in this process.
// - Option 1 (fallback): HTTP forwarding. If an action ID matches a remote
//   app pattern but is not registered via MF, the request is forwarded to
//   that app's /react endpoint and the response is proxied back.
app.post(
  '/react',
  handleErrors(async function (req, res) {
    const actionId = req.get(RSC_ACTION_HEADER);

    if (!actionId) {
      res.status(400).send('Missing RSC-Action header');
      return;
    }

    await waitForWebpack();

    // Get the bundled RSC server (await for asyncStartup)
    const server = await getRSCServer();

    // Load server actions manifest from build
    const manifestPath = path.resolve(
      __dirname,
      '../build/react-server-actions-manifest.json'
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
      dynamicManifest
    );

    const actionEntry = serverActionsManifest[actionId];

    // Ensure any MF-native remote actions are registered into the host
    // registry before we attempt lookup. This enables Option 2 for app2.
    await ensureRemoteActionsRegistered(server);

    // Load and execute the action
    // First check the global registry (for inline server actions registered at runtime)
    // Then fall back to module exports (for file-level 'use server' from manifest)
    let actionFn = server.getServerAction(actionId);
    let actionName = actionId.split('#')[1] || 'default';

    // If MF-native registration did not provide a function, fall back to
    // Option 1 (HTTP forwarding) for known remote actions.
    if (!actionFn) {
      const remoteApp = getRemoteAppForAction(actionId);
      if (remoteApp) {
        console.log(
          `[Federation] Action ${actionId} belongs to ${remoteApp.app}, ` +
            'no MF-registered handler found, forwarding via HTTP...'
        );
        await forwardActionToRemote(
          req,
          res,
          remoteApp.forwardedId,
          remoteApp.config
        );
        return;
      }
    }

    if (!actionFn && actionEntry) {
      // For bundled server actions, they should be in the registry
      // File-level actions are also bundled into server.rsc.js
      console.warn(
        `Action ${actionId} not in registry, manifest entry:`,
        actionEntry
      );
    }

    if (typeof actionFn !== 'function') {
      res
        .status(404)
        .send(
          `Server action "${actionId}" not found. ` +
            `Ensure the action module is imported in server-entry.js.`
        );
      return;
    }

    // Decode the action arguments using React's Flight Reply protocol
    const contentType = req.headers['content-type'] || '';
    let args;
    if (contentType.startsWith('multipart/form-data')) {
      const busboy = new Busboy({headers: req.headers});
      const pending = server.decodeReplyFromBusboy(
        busboy,
        serverActionsManifest
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

    // For now, re-render the app tree with the action result
    const location = req.query.location
      ? JSON.parse(req.query.location)
      : {
          selectedId: null,
          isEditing: false,
          searchText: '',
        };

    // Include action result in response header for client consumption
    if (result !== undefined) {
      res.set('X-Action-Result', JSON.stringify(result));
    }

    renderReactTree(res, {
      selectedId: location.selectedId,
      isEditing: location.isEditing,
      searchText: location.searchText,
    });
  })
);

const NOTES_PATH = path.resolve(__dirname, '../notes');

app.post(
  '/notes',
  express.json(),
  handleErrors(async function (req, res) {
    const now = new Date();
    const pool = await getPool();
    const result = await pool.query(
      'insert into notes (title, body, created_at, updated_at) values ($1, $2, $3, $3) returning id',
      [req.body.title, req.body.body, now]
    );
    const insertedId = result.rows[0].id;
    await writeFile(
      path.resolve(NOTES_PATH, `${insertedId}.md`),
      req.body.body,
      'utf8'
    );
    sendResponse(req, res, insertedId);
  })
);

app.put(
  '/notes/:id',
  express.json(),
  handleErrors(async function (req, res) {
    const now = new Date();
    const updatedId = Number(req.params.id);
    const pool = await getPool();
    await pool.query(
      'update notes set title = $1, body = $2, updated_at = $3 where id = $4',
      [req.body.title, req.body.body, now, updatedId]
    );
    await writeFile(
      path.resolve(NOTES_PATH, `${updatedId}.md`),
      req.body.body,
      'utf8'
    );
    sendResponse(req, res, null);
  })
);

app.delete(
  '/notes/:id',
  handleErrors(async function (req, res) {
    const pool = await getPool();
    await pool.query('delete from notes where id = $1', [req.params.id]);
    await unlink(path.resolve(NOTES_PATH, `${req.params.id}.md`));
    sendResponse(req, res, null);
  })
);

app.get(
  '/notes',
  handleErrors(async function (_req, res) {
    const pool = await getPool();
    const {rows} = await pool.query('select * from notes order by id desc');
    res.json(rows);
  })
);

app.get(
  '/notes/:id',
  handleErrors(async function (req, res) {
    const pool = await getPool();
    const {rows} = await pool.query('select * from notes where id = $1', [
      req.params.id,
    ]);
    res.json(rows[0]);
  })
);

app.get('/sleep/:ms', function (req, res) {
  setTimeout(() => {
    res.json({ok: true});
  }, req.params.ms);
});

app.use(express.static('build'));
app.use(express.static('public'));

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
