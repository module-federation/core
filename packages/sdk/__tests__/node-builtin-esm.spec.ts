import { jest } from '@jest/globals';

const createResponse = (body: string): Response =>
  ({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: jest.fn().mockResolvedValue(body),
  }) as unknown as Response;

const loadNodeEsmScript = (url = 'http://example.com/remoteEntry.js') =>
  new Promise((resolve, reject) => {
    import('../src/node').then(({ createScriptNode }) => {
      createScriptNode(
        url,
        (error, scriptContext) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(scriptContext);
        },
        { type: 'module' },
      );
    }, reject);
  });

describe('Node ESM builtin loading', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('loads node: builtin imports without fetching them as remote chunks', async () => {
    const fetchMock = jest.fn(async (url: string) => {
      if (url === 'node:url') {
        throw new Error('node:url should not be fetched');
      }

      return createResponse(
        "import { pathToFileURL } from 'node:url'; export const marker = pathToFileURL('/tmp/module-federation').href; export default {};",
      );
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const scriptContext = (await loadNodeEsmScript()) as {
      marker: string;
    };

    expect(scriptContext.marker).toBe('file:///tmp/module-federation');
    expect(fetchMock).toHaveBeenCalledWith('http://example.com/remoteEntry.js');
    expect(fetchMock).not.toHaveBeenCalledWith('node:url');
  });

  it('initializes import.meta.url for remote entries that create a Node.js require function', async () => {
    const remoteEntryUrl = 'http://example.com/server/remoteEntry.js';
    const fetchMock = jest.fn(async (url: string) => {
      if (url !== remoteEntryUrl) {
        throw new Error(`${url} should not be fetched`);
      }

      return createResponse(
        "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url); const path = require('node:path'); export const separator = path.sep; export const metaUrl = import.meta.url; export default {};",
      );
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const scriptContext = (await loadNodeEsmScript(remoteEntryUrl)) as {
      metaUrl: string;
      separator: string;
    };

    expect(scriptContext.separator).toBe('/');
    expect(scriptContext.metaUrl).toMatch(/^file:\/\/\//);
    expect(fetchMock).toHaveBeenCalledWith(remoteEntryUrl);
  });

  it('evaluates dynamically imported ESM chunks before their namespace is consumed', async () => {
    const remoteEntryUrl = 'http://example.com/server/remoteEntry.js';
    const chunkUrl = 'http://example.com/server/chunk.mjs';
    const fetchMock = jest.fn(async (url: string) => {
      if (url === remoteEntryUrl) {
        return createResponse(
          "export const chunkValuePromise = import('./chunk.mjs').then((chunk) => chunk.value); export default {};",
        );
      }

      if (url === chunkUrl) {
        return createResponse("export const value = 'loaded chunk';");
      }

      throw new Error(`${url} should not be fetched`);
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const scriptContext = (await loadNodeEsmScript(remoteEntryUrl)) as {
      chunkValuePromise: Promise<string>;
    };

    await expect(scriptContext.chunkValuePromise).resolves.toBe('loaded chunk');
    expect(fetchMock).toHaveBeenCalledWith(remoteEntryUrl);
    expect(fetchMock).toHaveBeenCalledWith(chunkUrl);
  });
});
