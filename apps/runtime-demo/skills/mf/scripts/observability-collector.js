#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const path = require('path');

const DEFAULT_PORT = 17891;
const DEFAULT_IDLE_MS = 10 * 60 * 1000;
const MAX_BODY_BYTES = 1024 * 1024;
const COLLECTOR_PATH = '/__mf_observability';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx >= 0) {
        args[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      } else {
        args[arg.slice(2)] = argv[i + 1] || '';
        i++;
      }
    }
  }
  return args;
}

function normalizePort(value) {
  const port = Number(value || DEFAULT_PORT);
  return Number.isInteger(port) && port > 0 && port <= 65535
    ? port
    : DEFAULT_PORT;
}

function isLocalOrigin(origin) {
  if (!origin) {
    return true;
  }

  try {
    const parsed = new URL(origin);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function sendJson(res, statusCode, value) {
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(`${JSON.stringify(value, null, 2)}\n`);
}

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (isLocalOrigin(origin)) {
    res.setHeader('access-control-allow-origin', origin || '*');
    res.setHeader('vary', 'origin');
  }
  res.setHeader('access-control-allow-methods', 'POST, GET, OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type');
  res.setHeader('access-control-max-age', '600');
}

function createSessionFiles(outputDir, sessionId) {
  const sessionDir = path.join(outputDir, sessionId);
  fs.mkdirSync(sessionDir, { recursive: true });

  return {
    sessionDir,
    eventsFile: path.join(sessionDir, 'events.jsonl'),
    latestFile: path.join(sessionDir, 'latest.json'),
    latestReportFile: path.join(sessionDir, 'latest-report.json'),
    sessionIndexFile: path.join(outputDir, 'latest-session.json'),
  };
}

function start() {
  const args = parseArgs(process.argv);
  const port = normalizePort(args.port);
  const idleMs = Number(args['idle-ms'] || DEFAULT_IDLE_MS);
  const outputDir = path.resolve(
    args.dir || path.join(process.cwd(), '.mf/observability/collector'),
  );
  const sessionId =
    args.session ||
    `session-${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}`;
  const files = createSessionFiles(outputDir, sessionId);
  let count = 0;
  let idleTimer = null;

  const server = http.createServer((req, res) => {
    applyCors(req, res);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === 'GET' && req.url === '/health') {
      sendJson(res, 200, {
        ok: true,
        port,
        sessionId,
        count,
        files,
      });
      return;
    }

    if (req.method === 'GET' && req.url === '/latest') {
      if (!fs.existsSync(files.latestFile)) {
        sendJson(res, 404, { error: 'No observability payload received yet.' });
        return;
      }
      res.writeHead(200, {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      });
      fs.createReadStream(files.latestFile).pipe(res);
      return;
    }

    if (req.method === 'GET' && req.url === '/events') {
      if (!fs.existsSync(files.eventsFile)) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('No observability events received yet.\n');
        return;
      }
      res.writeHead(200, {
        'content-type': 'application/x-ndjson; charset=utf-8',
        'cache-control': 'no-store',
      });
      fs.createReadStream(files.eventsFile).pipe(res);
      return;
    }

    if (req.method !== 'POST' || req.url !== COLLECTOR_PATH) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }

    if (!isLocalOrigin(req.headers.origin)) {
      sendJson(res, 403, { error: 'Only localhost origins are allowed.' });
      return;
    }

    let body = '';
    let size = 0;
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      size += Buffer.byteLength(chunk);
      if (size > MAX_BODY_BYTES) {
        res.writeHead(413, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload too large' }));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const record = {
          receivedAt: Date.now(),
          payload,
        };
        count += 1;
        fs.appendFileSync(files.eventsFile, `${JSON.stringify(record)}\n`);
        writeJson(files.latestFile, record);
        if (payload && payload.report) {
          writeJson(files.latestReportFile, payload.report);
        }
        writeJson(files.sessionIndexFile, {
          sessionId,
          port,
          count,
          updatedAt: Date.now(),
          files,
        });
        res.writeHead(204);
        res.end();
      } catch (error) {
        sendJson(res, 400, { error: error.message });
      }
    });
  });

  const close = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  const resetIdleTimer = () => {
    if (!idleMs) {
      return;
    }
    if (idleTimer) {
      clearTimeout(idleTimer);
    }
    idleTimer = setTimeout(close, idleMs);
  };

  server.on('request', resetIdleTimer);
  process.on('SIGINT', close);
  process.on('SIGTERM', close);

  server.listen(port, '127.0.0.1', () => {
    resetIdleTimer();
    writeJson(files.sessionIndexFile, {
      sessionId,
      port,
      count,
      updatedAt: Date.now(),
      files,
    });
    process.stdout.write(
      `${JSON.stringify(
        {
          status: 'listening',
          endpoint: `http://127.0.0.1:${port}${COLLECTOR_PATH}`,
          health: `http://127.0.0.1:${port}/health`,
          latest: `http://127.0.0.1:${port}/latest`,
          events: `http://127.0.0.1:${port}/events`,
          sessionId,
          files,
        },
        null,
        2,
      )}\n`,
    );
  });

  server.on('error', (error) => {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  });
}

start();
