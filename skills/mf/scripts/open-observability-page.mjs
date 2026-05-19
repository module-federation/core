#!/usr/bin/env node

import crypto from 'node:crypto';
import { access, readFile, writeFile } from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_PORT = 9222;
const DEFAULT_WAIT_MS = 8000;
const INJECTION_GLOBAL = '__MF_OBSERVABILITY_INJECTION__';
const SKILL_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const DEFAULT_IIFE_PATH = path.join(
  SKILL_DIR,
  'assets',
  'observability-chrome-devtool.iife.js',
);

function readArg(name, fallback) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function print(payload, asJson) {
  const output = asJson ? JSON.stringify(payload, null, 2) : payload.message;
  const stream = payload.ok === false ? process.stderr : process.stdout;
  stream.write(`${output}\n`);
}

function usage() {
  process.stdout.write(`Usage:
  node scripts/open-observability-page.mjs --url <url> [options]

Options:
  --url <url>              Target page URL. Required unless --help is used.
  --port <port>            Chrome remote debugging port. Default: 9222.
  --iife <file>            Observability chrome-devtool IIFE. Default: skill asset.
  --init-source <file>     Use an existing full browser init script instead of wrapping the IIFE.
  --options-json <json>    Extra options merged over the preset ChromeObservabilityPlugin options.
  --collector              Enable collector: true in the injected options.
  --collector-port <port>  Enable collector on a fixed port.
  --output <file>          Write a JSON capture file.
  --wait-ms <ms>           Wait after navigation before reading page state. Default: 8000.
  --dry-run                Read the init script, but do not connect to Chrome.
  --json                   Print JSON output.
`);
}

function parseJsonArg(name) {
  const raw = readArg(name);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('value must be a JSON object');
    }
    return parsed;
  } catch (error) {
    throw new Error(`Invalid --${name}: ${error.message}`);
  }
}

function deepMerge(base, patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return base;
  const result = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      result[key] &&
      typeof result[key] === 'object' &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function defaultObservabilityOptions(extraOptions) {
  const defaults = {
    level: 'verbose',
    console: true,
    browser: {
      enabled: true,
      mode: 'development',
    },
    trace: {
      printStart: true,
    },
    devtools: {
      enabled: true,
      source: 'module-federation/observability',
    },
  };

  return deepMerge(defaults, extraOptions);
}

function buildInitSourceFromIife(iifeSource, options) {
  return `
${iifeSource}
;
(() => {
const ChromeObservabilityPlugin =
  window.ChromeObservabilityPlugin ||
  window.ModuleFederationChromeObservabilityPlugin?.ChromeObservabilityPlugin ||
  window.ModuleFederationObservabilityPlugin?.ChromeObservabilityPlugin ||
  window.__FEDERATION_OBSERVABILITY_PLUGIN__?.ChromeObservabilityPlugin;
const OPTIONS = ${JSON.stringify(options, null, 2)};
const INJECTION_GLOBAL = ${JSON.stringify(INJECTION_GLOBAL)};
const DEVTOOLS_PLUGIN_NAME = 'observability-plugin:chrome-extension';
const LEGACY_DEVTOOLS_PLUGIN_NAME = 'observability-plugin-devtools';

const getTargetWindow = () => window;

const defineWritableGlobal = (key, value) => {
  const targetWindow = getTargetWindow();
  try {
    Object.defineProperty(targetWindow, key, {
      value,
      configurable: true,
      writable: true,
    });
  } catch {
    targetWindow[key] = value;
  }
};

const ensureFederationGlobal = () => {
  const targetWindow = getTargetWindow();
  const federation = targetWindow.__FEDERATION__ || targetWindow.__VMOK__ || {};

  if (!targetWindow.__FEDERATION__) {
    defineWritableGlobal('__FEDERATION__', federation);
  }
  if (!targetWindow.__VMOK__) {
    defineWritableGlobal('__VMOK__', targetWindow.__FEDERATION__);
  }

  targetWindow.__FEDERATION__.__GLOBAL_PLUGIN__ ||= [];
  return targetWindow.__FEDERATION__;
};

const notify = (payload) => {
  getTargetWindow()[INJECTION_GLOBAL] = payload;
  try {
    window.postMessage(
      {
        schemaVersion: 1,
        source: 'mf-agent-observability-injector',
        ...payload,
      },
      '*',
    );
  } catch {
    // Notification is best effort only.
  }
};

const install = () => {
  const createdAt = Date.now();
  try {
    if (typeof ChromeObservabilityPlugin !== 'function') {
      throw new Error('ChromeObservabilityPlugin export is missing');
    }

    const federation = ensureFederationGlobal();
    const globalPlugins = federation.__GLOBAL_PLUGIN__ || [];
    const existing = globalPlugins.some(
      (plugin) =>
        plugin?.name === DEVTOOLS_PLUGIN_NAME ||
        plugin?.name === LEGACY_DEVTOOLS_PLUGIN_NAME,
    );

    if (existing) {
      notify({
        ok: true,
        status: 'skipped',
        reason: 'already-installed',
        scope: 'chrome_extension',
        pluginName: DEVTOOLS_PLUGIN_NAME,
        createdAt,
      });
      return;
    }

    const plugin = ChromeObservabilityPlugin(OPTIONS);
    globalPlugins.push(plugin);
    federation.__GLOBAL_PLUGIN__ = globalPlugins;

    notify({
      ok: true,
      status: 'installed',
      scope: 'chrome_extension',
      pluginName: plugin?.name || DEVTOOLS_PLUGIN_NAME,
      createdAt,
    });
  } catch (error) {
    console.error('[MF Observability Injector]', error);
    notify({
      ok: false,
      status: 'error',
      message: error?.message || String(error),
      scope: 'chrome_extension',
      createdAt,
    });
  }
};

install();
})();
`;
}

async function readIifeSource(iifePath, extraOptions) {
  const resolvedPath = path.resolve(iifePath);
  try {
    await access(resolvedPath);
  } catch {
    throw new Error(
      `Observability IIFE not found: ${resolvedPath}. Copy the chrome-devtool IIFE to that path or pass --iife <file>.`,
    );
  }

  return {
    source: buildInitSourceFromIife(
      await readFile(resolvedPath, 'utf8'),
      defaultObservabilityOptions(extraOptions),
    ),
    sourceKind: 'iife',
    iifePath: resolvedPath,
  };
}

function httpRequest(method, port, requestPath) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        method,
        path: requestPath,
        timeout: 3000,
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body));
            } catch {
              resolve(body);
            }
            return;
          }
          reject(
            new Error(
              `${method} ${requestPath} failed with ${res.statusCode}: ${body}`,
            ),
          );
        });
      },
    );
    req.on('timeout', () => {
      req.destroy(new Error(`${method} ${requestPath} timed out`));
    });
    req.on('error', reject);
    req.end();
  });
}

async function createPage(port) {
  const encoded = encodeURIComponent('about:blank');
  try {
    return await httpRequest('PUT', port, `/json/new?${encoded}`);
  } catch {
    return httpRequest('GET', port, `/json/new?${encoded}`);
  }
}

function writeWsFrame(socket, text, opcode = 0x1) {
  const payload = Buffer.from(text);
  const mask = crypto.randomBytes(4);
  let header;

  if (payload.length < 126) {
    header = Buffer.alloc(2);
    header[1] = 0x80 | payload.length;
  } else if (payload.length <= 0xffff) {
    header = Buffer.alloc(4);
    header[1] = 0x80 | 126;
    header.writeUInt16BE(payload.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[1] = 0x80 | 127;
    header.writeBigUInt64BE(BigInt(payload.length), 2);
  }

  header[0] = 0x80 | opcode;
  const masked = Buffer.alloc(payload.length);
  for (let i = 0; i < payload.length; i += 1) {
    masked[i] = payload[i] ^ mask[i % 4];
  }

  socket.write(Buffer.concat([header, mask, masked]));
}

class CdpConnection {
  constructor(socket) {
    this.socket = socket;
    this.buffer = Buffer.alloc(0);
    this.nextId = 1;
    this.pending = new Map();
    this.eventWaiters = new Map();
    socket.on('data', (chunk) => this.handleData(chunk));
    socket.on('error', (error) => this.rejectAll(error));
    socket.on('close', () => this.rejectAll(new Error('CDP socket closed')));
  }

  send(method, params = {}, timeoutMs = 10000) {
    const id = this.nextId;
    this.nextId += 1;
    const payload = JSON.stringify({ id, method, params });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`${method} timed out`));
      }, timeoutMs);
      this.pending.set(id, { method, resolve, reject, timeout });
      writeWsFrame(this.socket, payload);
    });
  }

  waitForEvent(method, timeoutMs) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.eventWaiters.delete(method);
        resolve(undefined);
      }, timeoutMs);
      this.eventWaiters.set(method, { resolve, timeout });
    });
  }

  close() {
    this.socket.end();
  }

  rejectAll(error) {
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timeout);
      pending.reject(error);
    }
    this.pending.clear();
  }

  handleData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (this.buffer.length >= 2) {
      const first = this.buffer[0];
      const second = this.buffer[1];
      const opcode = first & 0x0f;
      const masked = Boolean(second & 0x80);
      let length = second & 0x7f;
      let offset = 2;

      if (length === 126) {
        if (this.buffer.length < offset + 2) return;
        length = this.buffer.readUInt16BE(offset);
        offset += 2;
      } else if (length === 127) {
        if (this.buffer.length < offset + 8) return;
        length = Number(this.buffer.readBigUInt64BE(offset));
        offset += 8;
      }

      let mask;
      if (masked) {
        if (this.buffer.length < offset + 4) return;
        mask = this.buffer.subarray(offset, offset + 4);
        offset += 4;
      }

      if (this.buffer.length < offset + length) return;

      let payload = this.buffer.subarray(offset, offset + length);
      this.buffer = this.buffer.subarray(offset + length);

      if (masked && mask) {
        const unmasked = Buffer.alloc(payload.length);
        for (let i = 0; i < payload.length; i += 1) {
          unmasked[i] = payload[i] ^ mask[i % 4];
        }
        payload = unmasked;
      }

      if (opcode === 0x8) {
        this.close();
        return;
      }
      if (opcode === 0x9) {
        writeWsFrame(this.socket, payload, 0xa);
        continue;
      }
      if (opcode !== 0x1) {
        continue;
      }

      this.handleMessage(payload.toString('utf8'));
    }
  }

  handleMessage(text) {
    let message;
    try {
      message = JSON.parse(text);
    } catch {
      return;
    }

    if (message.id && this.pending.has(message.id)) {
      const pending = this.pending.get(message.id);
      this.pending.delete(message.id);
      clearTimeout(pending.timeout);
      if (message.error) {
        pending.reject(
          new Error(
            `${pending.method} failed: ${message.error.message || JSON.stringify(message.error)}`,
          ),
        );
      } else {
        pending.resolve(message.result);
      }
      return;
    }

    if (message.method && this.eventWaiters.has(message.method)) {
      const waiter = this.eventWaiters.get(message.method);
      this.eventWaiters.delete(message.method);
      clearTimeout(waiter.timeout);
      waiter.resolve(message.params);
    }
  }
}

function connectWebSocket(wsUrl) {
  const url = new URL(wsUrl);
  const key = crypto.randomBytes(16).toString('base64');
  const port = Number(url.port || 80);

  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: url.hostname, port });
    let header = Buffer.alloc(0);
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error(`WebSocket connect timed out: ${wsUrl}`));
    }, 5000);

    socket.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    socket.on('connect', () => {
      socket.write(
        [
          `GET ${url.pathname}${url.search} HTTP/1.1`,
          `Host: ${url.host}`,
          'Upgrade: websocket',
          'Connection: Upgrade',
          `Sec-WebSocket-Key: ${key}`,
          'Sec-WebSocket-Version: 13',
          '',
          '',
        ].join('\r\n'),
      );
    });

    const onData = (chunk) => {
      header = Buffer.concat([header, chunk]);
      const index = header.indexOf('\r\n\r\n');
      if (index === -1) return;

      clearTimeout(timeout);
      socket.off('data', onData);
      const response = header.subarray(0, index).toString('utf8');
      if (!response.includes(' 101 ')) {
        socket.destroy();
        reject(new Error(`WebSocket upgrade failed: ${response}`));
        return;
      }

      const rest = header.subarray(index + 4);
      const connection = new CdpConnection(socket);
      if (rest.length) connection.handleData(rest);
      resolve(connection);
    };

    socket.on('data', onData);
  });
}

function evaluateExpression(cdp, expression) {
  return cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
}

async function main() {
  if (hasFlag('help')) {
    usage();
    return;
  }

  const asJson = hasFlag('json');
  const dryRun = hasFlag('dry-run');
  const targetUrl = readArg('url');
  const port = Number(readArg('port', String(DEFAULT_PORT)));
  const waitMs = Number(readArg('wait-ms', String(DEFAULT_WAIT_MS)));
  const iifePath = readArg(
    'iife',
    process.env.MF_OBSERVABILITY_IIFE || DEFAULT_IIFE_PATH,
  );
  const initSourcePath = readArg('init-source');
  const outputPath = readArg('output');
  const extraOptions = parseJsonArg('options-json');

  if (hasFlag('collector')) {
    extraOptions.collector = true;
  }

  const collectorPort = readArg('collector-port');
  if (collectorPort) {
    extraOptions.collector = {
      enabled: true,
      port: Number(collectorPort),
    };
  }

  if (!targetUrl) {
    throw new Error('Missing --url');
  }
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid --port: ${String(port)}`);
  }
  if (!Number.isInteger(waitMs) || waitMs < 0) {
    throw new Error(`Invalid --wait-ms: ${String(waitMs)}`);
  }

  const init = initSourcePath
    ? {
        source: await readFile(path.resolve(initSourcePath), 'utf8'),
        sourceKind: 'init-source-file',
        initSourcePath: path.resolve(initSourcePath),
      }
    : await readIifeSource(iifePath, extraOptions);

  const baseResult = {
    ok: true,
    targetUrl,
    port,
    waitMs,
    sourceKind: init.sourceKind,
    initSourcePath: init.initSourcePath,
    iifePath: init.iifePath,
    initSourceLength: init.source.length,
    scope: 'chrome_extension',
  };

  if (dryRun) {
    print(
      {
        ...baseResult,
        status: 'dry-run',
        message:
          'Dry run finished. Init source was read, but Chrome was not opened.',
      },
      asJson,
    );
    return;
  }

  const version = await httpRequest('GET', port, '/json/version').catch(
    (error) => {
      throw new Error(
        `Chrome debug port ${port} is not available: ${error.message}. Run scripts/open-chrome-debug.mjs first.`,
      );
    },
  );
  const page = await createPage(port);
  const webSocketDebuggerUrl = page.webSocketDebuggerUrl;
  if (!webSocketDebuggerUrl) {
    throw new Error('Chrome did not return a page WebSocket URL');
  }

  const cdp = await connectWebSocket(webSocketDebuggerUrl);
  const loadEvent = cdp.waitForEvent('Page.loadEventFired', waitMs + 5000);

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  const addScriptResult = await cdp.send(
    'Page.addScriptToEvaluateOnNewDocument',
    {
      source: init.source,
    },
  );
  await cdp.send('Page.navigate', { url: targetUrl });
  await Promise.race([
    loadEvent,
    new Promise((resolve) => setTimeout(resolve, waitMs)),
  ]);

  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, Math.min(waitMs, 2000)));
  }

  const pageStateResult = await evaluateExpression(
    cdp,
    `(() => {
      const observability = window.__FEDERATION__ && window.__FEDERATION__.__OBSERVABILITY__;
      return {
        href: location.href,
        title: document.title,
        injection: window[${JSON.stringify(INJECTION_GLOBAL)}] || null,
        hasFederation: Boolean(window.__FEDERATION__),
        hasVmok: Boolean(window.__VMOK__),
        scopes: observability ? Object.keys(observability) : [],
      };
    })()`,
  ).catch((error) => ({
    exceptionDetails: {
      text: error.message,
    },
  }));

  cdp.close();

  const pageState = pageStateResult?.result?.value;
  const result = {
    ...baseResult,
    status: 'opened',
    browser: {
      product: version.Browser,
      protocolVersion: version['Protocol-Version'],
    },
    pageId: page.id,
    addScriptIdentifier: addScriptResult.identifier,
    finalUrl: pageState?.href,
    title: pageState?.title,
    injection: pageState?.injection,
    hasFederation: pageState?.hasFederation,
    hasVmok: pageState?.hasVmok,
    scopes: pageState?.scopes,
    readExpression:
      "window.__FEDERATION__.__OBSERVABILITY__['chrome_extension'].getLatestReport()",
    message:
      'Opened page with the observability init script registered before navigation.',
  };

  if (outputPath) {
    result.outputPath = path.resolve(outputPath);
    await writeFile(result.outputPath, JSON.stringify(result, null, 2));
  }

  print(result, asJson);
}

main().catch((error) => {
  const asJson = hasFlag('json');
  print(
    {
      ok: false,
      status: 'failed',
      message: error.message,
    },
    asJson,
  );
  process.exit(1);
});
