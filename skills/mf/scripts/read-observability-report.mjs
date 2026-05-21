#!/usr/bin/env node

import crypto from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';

const DEFAULT_PORT = 9222;
const DEFAULT_SCOPE = 'auto';
const DEFAULT_LIMIT = 10;

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
  node skills/mf/scripts/read-observability-report.mjs --port <port> [options]

Options:
  --port <port>          Chrome remote debugging port. Default: 9222.
  --page-id <id>         Read a specific Chrome target page id.
  --url-contains <text>  Read the first page whose URL contains this text.
  --scope <scope>        Browser report scope. Default: auto. Use chrome_extension for temporary injection.
  --limit <n>            Number of recent reports to read. Default: 10.
  --trace-id <id>        Read and export a specific trace id.
  --remote <name>        Also run findReports({ remote }).
  --expose <name>        Also run findReports({ expose }).
  --shared <name>        Also run findReports({ shared }).
  --output <file>        Write the read result to this JSON file.
  --dry-run              Print the planned read, but do not connect to Chrome.
  --json                 Print JSON output.
`);
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
  for (let index = 0; index < payload.length; index += 1) {
    masked[index] = payload[index] ^ mask[index % 4];
  }

  socket.write(Buffer.concat([header, mask, masked]));
}

class CdpConnection {
  constructor(socket) {
    this.socket = socket;
    this.buffer = Buffer.alloc(0);
    this.nextId = 1;
    this.pending = new Map();
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
        for (let index = 0; index < payload.length; index += 1) {
          unmasked[index] = payload[index] ^ mask[index % 4];
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
      if (opcode !== 0x1) continue;

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

    if (!message.id || !this.pending.has(message.id)) return;

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

function selectPage(pages, pageId, urlContains) {
  const pageTargets = pages.filter((page) => page.type === 'page');
  if (pageId) return pageTargets.find((page) => page.id === pageId);
  if (urlContains) {
    return pageTargets.find((page) => page.url?.includes(urlContains));
  }
  return pageTargets.find((page) => page.url && page.url !== 'about:blank');
}

function buildReadExpression({
  scope,
  limit,
  traceId,
  remote,
  expose,
  shared,
}) {
  return `(() => {
    const observability =
      window.__FEDERATION__ && window.__FEDERATION__.__OBSERVABILITY__;
    const scopes = observability ? Object.keys(observability) : [];
    const requestedScope = ${JSON.stringify(scope)};
    const selectedScope =
      requestedScope === 'auto'
        ? (scopes.includes('chrome_extension') ? 'chrome_extension' : scopes[0])
        : requestedScope;
    const reader = observability && selectedScope ? observability[selectedScope] : null;
    const result = {
      href: location.href,
      title: document.title,
      requestedScope,
      scope: selectedScope || requestedScope,
      scopes,
      hasFederation: Boolean(window.__FEDERATION__),
      hasVmok: Boolean(window.__VMOK__),
      latestReport: null,
      reports: [],
      filters: {},
      traceReport: null,
      exportedReport: null,
      readError: null,
    };

    if (!reader) {
      result.readError = 'Observability reader scope is missing';
      return result;
    }

    try {
      result.latestReport =
        typeof reader.getLatestReport === 'function'
          ? reader.getLatestReport()
          : null;
      result.reports =
        typeof reader.getReports === 'function'
          ? reader.getReports({ limit: ${Number(limit)} })
          : [];
      if (${JSON.stringify(traceId)}) {
        result.traceReport =
          typeof reader.getReport === 'function'
            ? reader.getReport(${JSON.stringify(traceId)})
            : null;
        result.exportedReport =
          typeof reader.exportReport === 'function'
            ? reader.exportReport(${JSON.stringify(traceId)})
            : null;
      }
      if (${JSON.stringify(remote)}) {
        result.filters.remote =
          typeof reader.findReports === 'function'
            ? reader.findReports({ remote: ${JSON.stringify(remote)} })
            : [];
      }
      if (${JSON.stringify(expose)}) {
        result.filters.expose =
          typeof reader.findReports === 'function'
            ? reader.findReports({ expose: ${JSON.stringify(expose)} })
            : [];
      }
      if (${JSON.stringify(shared)}) {
        result.filters.shared =
          typeof reader.findReports === 'function'
            ? reader.findReports({ shared: ${JSON.stringify(shared)} })
            : [];
      }
    } catch (error) {
      result.readError = error?.message || String(error);
    }

    return result;
  })()`;
}

async function main() {
  if (hasFlag('help')) {
    usage();
    return;
  }

  const asJson = hasFlag('json');
  const dryRun = hasFlag('dry-run');
  const port = Number(readArg('port', String(DEFAULT_PORT)));
  const pageId = readArg('page-id');
  const urlContains = readArg('url-contains');
  const scope = readArg('scope', DEFAULT_SCOPE);
  const limit = Number(readArg('limit', String(DEFAULT_LIMIT)));
  const traceId = readArg('trace-id');
  const remote = readArg('remote');
  const expose = readArg('expose');
  const shared = readArg('shared');
  const outputPath = readArg('output');

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid --port: ${String(port)}`);
  }
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error(`Invalid --limit: ${String(limit)}`);
  }

  const planned = {
    ok: true,
    status: dryRun ? 'dry-run' : 'planned',
    port,
    pageId,
    urlContains,
    scope,
    limit,
    traceId,
    remote,
    expose,
    shared,
    outputPath: outputPath ? path.resolve(outputPath) : undefined,
  };

  if (dryRun) {
    print(
      {
        ...planned,
        message: 'Dry run finished. Chrome was not contacted.',
      },
      asJson,
    );
    return;
  }

  const pages = await httpRequest('GET', port, '/json/list');
  const page = selectPage(
    Array.isArray(pages) ? pages : [],
    pageId,
    urlContains,
  );
  if (!page?.webSocketDebuggerUrl) {
    throw new Error('No matching Chrome page target was found.');
  }

  const cdp = await connectWebSocket(page.webSocketDebuggerUrl);
  await cdp.send('Runtime.enable');

  const expression = buildReadExpression({
    scope,
    limit,
    traceId,
    remote,
    expose,
    shared,
  });
  const readResult = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  cdp.close();

  const resultValue = readResult?.result?.value;
  const result = {
    ...planned,
    status: 'read',
    pageId: page.id,
    pageUrl: page.url,
    pageTitle: page.title,
    selectedScope: resultValue?.scope,
    readerExpression:
      scope === 'auto'
        ? 'window.__FEDERATION__.__OBSERVABILITY__[auto-selected scope]'
        : `window.__FEDERATION__.__OBSERVABILITY__[${JSON.stringify(scope)}]`,
    result: resultValue,
    exceptionDetails: readResult?.exceptionDetails,
    message: 'Observability report read finished.',
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
