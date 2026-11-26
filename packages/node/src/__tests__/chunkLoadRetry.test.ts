import { once } from 'node:events';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { runInNewContext } from 'node:vm';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { httpVmStrategy } from '../filesystem/stratagies';
import {
  generateInstallChunk,
  generateLoadingCode,
} from '../plugins/webpackChunkUtilities';

const RuntimeTemplate = require(
  normalizeWebpackPath('webpack/lib/RuntimeTemplate'),
);

it('requests a remote chunk again after an interrupted response', async () => {
  const requests: string[] = [];
  const body = Buffer.from(
    'exports.ids = ["retry"]; exports.modules = { value: (module) => { module.exports = "loaded"; } };',
  );

  const server = createServer((request, response) => {
    requests.push(`${request.method} ${request.url}`);
    response.writeHead(200, {
      'Content-Length': body.length,
      Connection: 'close',
    });
    response.end(requests.length === 1 ? body.subarray(0, 16) : body);
  });

  try {
    server.listen(0, '127.0.0.1');
    server.unref();
    await once(server, 'listening');
    const { port } = server.address() as AddressInfo;

    const handlers = {} as {
      readFileVm: (id: string, pending: Promise<void>[]) => void;
    };
    const modules: Record<string, (module: { exports: unknown }) => void> = {};
    const webpackRequire = {
      u: (id: string) => `${id}.js`,
      p: `http://127.0.0.1:${port}/`,
      o: Object.hasOwn,
      m: modules,
      federation: { initOptions: { name: 'remote', remotes: {} } },
    };
    const runtimeTemplate = new RuntimeTemplate(
      {},
      { globalObject: 'globalThis', environment: {} },
    );

    runInNewContext(
      [
        'const installedChunks = {};',
        httpVmStrategy.toString(),
        'const loadChunkStrategy = (_, ...args) => httpVmStrategy(...args);',
        generateInstallChunk(runtimeTemplate, false),
        generateLoadingCode(true, 'handlers', true, '', {}, 'remote'),
      ].join('\n'),
      {
        __webpack_require__: webpackRequire,
        __dirname,
        handlers,
        process,
        require,
        URL,
      },
    );

    const load = () => {
      const pending: Promise<void>[] = [];
      handlers.readFileVm('retry', pending);
      return pending;
    };

    const [firstAttempt] = load();
    expect(load()[0]).toBe(firstAttempt);
    await expect(firstAttempt).rejects.toMatchObject({ code: 'ECONNRESET' });
    expect(requests).toEqual(['GET /retry.js']);

    await expect(load()[0]).resolves.toBeUndefined();
    const module = { exports: undefined };
    modules.value(module);
    expect(module.exports).toBe('loaded');

    expect(load()).toHaveLength(0);
    expect(requests).toEqual(['GET /retry.js', 'GET /retry.js']);
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
      server.closeAllConnections();
    });
  }
});
