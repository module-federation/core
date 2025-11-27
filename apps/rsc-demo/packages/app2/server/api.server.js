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

// Remote app runs on 4102 by default (tests assume this)
const PORT = process.env.PORT || 4102;

// Database will be loaded from bundled RSC server
// This is lazy-loaded to allow the bundle to be loaded first
let pool = null;
const app = express();

app.use(compress());
// Allow cross-origin access so Module Federation remotes can be consumed
// from other apps (e.g., app1 at a different port) via fetch/script.
app.use(function (_req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});
// Serve built assets (including MF remote entries) from root and /build
const buildDir = path.resolve(__dirname, '../build');
app.use(express.static(buildDir));
app.use('/build', express.static(buildDir));

// Lazy-load the bundled RSC server code
// This is built by webpack with react-server condition resolved at build time
// With asyncStartup: true, the require returns a promise that resolves to the module
let rscServerPromise = null;
let rscServerResolved = null;
let babelRegistered = false;

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

async function getPool() {
  if (!pool) {
    const server = await getRSCServer();
    pool = server.pool;
  }
  return pool;
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

    // Load and execute the action
    // First check the global registry (for inline server actions registered at runtime)
    // Then fall back to module exports (for file-level 'use server' from manifest)
    let actionFn = server.getServerAction(actionId);
    let actionName = actionId.split('#')[1] || 'default';

    // No more Babel-based lazy registration; rely on MF runtime to register remote actions.

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
      throw new Error(msg);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

module.exports = app;
