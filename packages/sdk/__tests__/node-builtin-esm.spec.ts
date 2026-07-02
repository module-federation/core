import { jest } from '@jest/globals';
import { sep as pathSeparator } from 'node:path';
import { pathToFileURL } from 'node:url';

const createResponse = (body: string) => ({
  text: async () => body,
});

const loadNodeEsmScript = async <T = unknown>(
  url = 'http://example.com/remoteEntry.js',
): Promise<T> => {
  const { createScriptNode } = await import('../src/node');

  return new Promise<T>((resolve, reject) => {
    createScriptNode(
      url,
      (error, scriptContext) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(scriptContext as T);
      },
      { type: 'module' },
    );
  });
};

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

    const scriptContext = await loadNodeEsmScript<{
      marker: string;
    }>();

    expect(scriptContext.marker).toBe('file:///tmp/module-federation');
    expect(fetchMock).toHaveBeenCalledWith('http://example.com/remoteEntry.js');
    expect(fetchMock).not.toHaveBeenCalledWith('node:url');
  });

  it('loads bare Node.js builtin imports without fetching them as remote chunks', async () => {
    const fetchMock = jest.fn(async (url: string) => {
      if (url === 'path') {
        throw new Error('path should not be fetched');
      }

      return createResponse(
        "import { sep } from 'path'; export const separator = sep; export default {};",
      );
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const scriptContext = await loadNodeEsmScript<{
      separator: string;
    }>();

    expect(scriptContext.separator).toBe(pathSeparator);
    expect(fetchMock).toHaveBeenCalledWith('http://example.com/remoteEntry.js');
    expect(fetchMock).not.toHaveBeenCalledWith('path');
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

    const scriptContext = await loadNodeEsmScript<{
      metaUrl: string;
      separator: string;
    }>(remoteEntryUrl);

    expect(scriptContext.separator).toBe(pathSeparator);
    expect(scriptContext.metaUrl).toMatch(/^file:\/\/\//);
    expect(fetchMock).toHaveBeenCalledWith(remoteEntryUrl);
  });

  it('bases import.meta.url under the current workspace for createRequire package resolution', async () => {
    const remoteEntryUrl = 'http://example.com/server/remoteEntry.js';
    const fetchMock = jest.fn(async (url: string) => {
      if (url !== remoteEntryUrl) {
        throw new Error(`${url} should not be fetched`);
      }

      return createResponse(
        "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url); const webpack = require('webpack'); export const webpackType = typeof webpack; export const metaUrl = import.meta.url; export default {};",
      );
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const scriptContext = await loadNodeEsmScript<{
      metaUrl: string;
      webpackType: string;
    }>(remoteEntryUrl);
    const cwdFileUrl = pathToFileURL(process.cwd()).href;
    const cwdBaseUrl = cwdFileUrl.endsWith('/') ? cwdFileUrl : `${cwdFileUrl}/`;

    expect(['function', 'object']).toContain(scriptContext.webpackType);
    expect(scriptContext.metaUrl).toContain(
      '__module_federation_remote__/http/example.com/server/remoteEntry.js',
    );
    expect(scriptContext.metaUrl.startsWith(cwdBaseUrl)).toBe(true);
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

    const scriptContext = await loadNodeEsmScript<{
      chunkValuePromise: Promise<string>;
    }>(remoteEntryUrl);

    await expect(scriptContext.chunkValuePromise).resolves.toBe('loaded chunk');
    expect(fetchMock).toHaveBeenCalledWith(remoteEntryUrl);
    expect(fetchMock).toHaveBeenCalledWith(chunkUrl);
  });

  it('rejects absolute non-http module URLs without fetching them', async () => {
    const remoteEntryUrl = 'http://example.com/server/remoteEntry.js';
    const fileChunkUrl = 'file:///tmp/chunk.mjs';
    const fetchMock = jest.fn(async (url: string) => {
      if (url !== remoteEntryUrl) {
        throw new Error(`${url} should not be fetched`);
      }

      return createResponse(
        `import value from '${fileChunkUrl}'; export default value;`,
      );
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(loadNodeEsmScript(remoteEntryUrl)).rejects.toThrow(
      `Unsupported ESM module specifier "${fileChunkUrl}"`,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(remoteEntryUrl);
    expect(fetchMock).not.toHaveBeenCalledWith(fileChunkUrl);
  });

  it('rejects bare non-builtin imports instead of fetching them as relative chunks', async () => {
    const remoteEntryUrl = 'http://example.com/server/remoteEntry.js';
    const fetchMock = jest.fn(async (url: string) => {
      if (url !== remoteEntryUrl) {
        throw new Error(`${url} should not be fetched`);
      }

      return createResponse("import React from 'react'; export default React;");
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(loadNodeEsmScript(remoteEntryUrl)).rejects.toThrow(
      'Unsupported ESM module specifier "react"',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(remoteEntryUrl);
  });
});
