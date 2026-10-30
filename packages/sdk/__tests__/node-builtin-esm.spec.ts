import { jest } from '@jest/globals';
import { sep as pathSeparator } from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_REMOTE_ENTRY_URL = 'http://example.com/remoteEntry.js';

const createResponse = (
  body: string,
  init: { ok?: boolean; status?: number; statusText?: string } = {},
) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  ...init,
  text: async () => body,
});

const moduleSource = (source: TemplateStringsArray, ...values: string[]) =>
  String.raw(source, ...values).trim();

const setFetchMock = (
  handler: (url: string) => ReturnType<typeof createResponse>,
) => {
  const fetchMock = jest.fn(async (url: string) => handler(url));
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  return fetchMock;
};

const setRemoteEntryFetchMock = (remoteEntryUrl: string, body: string) =>
  setFetchMock((url) => {
    if (url !== remoteEntryUrl) {
      throw new Error(`${url} should not be fetched`);
    }

    return createResponse(body);
  });

const loadNodeEsmScript = async <T = unknown>(
  url = DEFAULT_REMOTE_ENTRY_URL,
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

const loadNodeScript = async <T = unknown>(
  url = DEFAULT_REMOTE_ENTRY_URL,
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
      {},
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
    const fetchMock = setRemoteEntryFetchMock(
      DEFAULT_REMOTE_ENTRY_URL,
      moduleSource`
        import { pathToFileURL } from 'node:url';

        export const marker = pathToFileURL('/tmp/module-federation').href;
        export default {};
      `,
    );

    const scriptContext = await loadNodeEsmScript<{
      marker: string;
    }>();

    expect(scriptContext.marker).toBe('file:///tmp/module-federation');
    expect(fetchMock).toHaveBeenCalledWith(DEFAULT_REMOTE_ENTRY_URL);
    expect(fetchMock).not.toHaveBeenCalledWith('node:url');
  });

  it('loads bare Node.js builtin imports without fetching them as remote chunks', async () => {
    const fetchMock = setRemoteEntryFetchMock(
      DEFAULT_REMOTE_ENTRY_URL,
      moduleSource`
        import { sep } from 'path';

        export const separator = sep;
        export default {};
      `,
    );

    const scriptContext = await loadNodeEsmScript<{
      separator: string;
    }>();

    expect(scriptContext.separator).toBe(pathSeparator);
    expect(fetchMock).toHaveBeenCalledWith(DEFAULT_REMOTE_ENTRY_URL);
    expect(fetchMock).not.toHaveBeenCalledWith('path');
  });

  it('bases import.meta.url under the current workspace for createRequire package resolution', async () => {
    const remoteEntryUrl =
      'http://example.com/server/remoteEntry.js?v=123#entry';
    const fetchMock = setRemoteEntryFetchMock(
      remoteEntryUrl,
      moduleSource`
        import { createRequire } from 'node:module';

        const require = createRequire(import.meta.url);
        const webpack = require('webpack');

        export const webpackType = typeof webpack;
        export const metaUrl = import.meta.url;
        export default {};
      `,
    );

    const scriptContext = await loadNodeEsmScript<{
      metaUrl: string;
      webpackType: string;
    }>(remoteEntryUrl);
    const cwdFileUrl = pathToFileURL(process.cwd()).href;
    const cwdBaseUrl = cwdFileUrl.endsWith('/') ? cwdFileUrl : `${cwdFileUrl}/`;

    expect(['function', 'object']).toContain(scriptContext.webpackType);
    expect(scriptContext.metaUrl).toContain(
      '__module_federation_remote__/http/example.com/server/remoteEntry.js/%3Fv%3D123%23entry',
    );
    expect(scriptContext.metaUrl.startsWith(cwdBaseUrl)).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(remoteEntryUrl);
  });

  it('evaluates dynamically imported ESM chunks before their namespace is consumed', async () => {
    const remoteEntryUrl = 'http://example.com/server/remoteEntry.js';
    const chunkUrl = 'http://example.com/server/chunk.mjs';
    const fetchMock = setFetchMock((url) => {
      if (url === remoteEntryUrl) {
        return createResponse(
          moduleSource`
            export const chunkValuePromise = import('./chunk.mjs').then(
              (chunk) => chunk.value,
            );
            export default {};
          `,
        );
      }

      if (url === chunkUrl) {
        return createResponse(
          moduleSource`
            export const value = 'loaded chunk';
          `,
        );
      }

      throw new Error(`${url} should not be fetched`);
    });

    const scriptContext = await loadNodeEsmScript<{
      chunkValuePromise: Promise<string>;
    }>(remoteEntryUrl);

    await expect(scriptContext.chunkValuePromise).resolves.toBe('loaded chunk');
    expect(fetchMock).toHaveBeenCalledWith(remoteEntryUrl);
    expect(fetchMock).toHaveBeenCalledWith(chunkUrl);
  });

  it('evicts ESM modules from the cache after a transitive link failure', async () => {
    const remoteEntryUrl = 'http://example.com/server/remoteEntry.mjs';
    const chunkAUrl = 'http://example.com/server/chunk-a.mjs';
    const chunkBUrl = 'http://example.com/server/chunk-b.mjs';
    let chunkBAttempts = 0;
    const fetchMock = setFetchMock((url) => {
      if (url === remoteEntryUrl) {
        return createResponse(
          moduleSource`
            import { value } from './chunk-a.mjs';

            export const result = value;
          `,
        );
      }

      if (url === chunkAUrl) {
        return createResponse(
          moduleSource`
            import { value as chunkValue } from './chunk-b.mjs';

            export const value = chunkValue;
          `,
        );
      }

      if (url === chunkBUrl) {
        chunkBAttempts += 1;
        if (chunkBAttempts === 1) {
          throw new TypeError('transient chunk failure');
        }

        return createResponse(`export const value = 'recovered';`);
      }

      throw new Error(`${url} should not be fetched`);
    });

    await expect(loadNodeEsmScript(remoteEntryUrl)).rejects.toThrow(
      'transient chunk failure',
    );

    await expect(
      loadNodeEsmScript<{ result: string }>(remoteEntryUrl),
    ).resolves.toMatchObject({ result: 'recovered' });
    expect(chunkBAttempts).toBe(2);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      remoteEntryUrl,
      chunkAUrl,
      chunkBUrl,
      remoteEntryUrl,
      chunkAUrl,
      chunkBUrl,
    ]);
  });

  it('evicts an ESM module from the cache after an evaluation failure', async () => {
    const remoteEntryUrl = 'http://example.com/server/evaluation.mjs';
    let attempts = 0;
    const fetchMock = setFetchMock((url) => {
      expect(url).toBe(remoteEntryUrl);
      attempts += 1;

      return createResponse(
        attempts === 1
          ? `throw new Error('transient evaluation failure');`
          : `export const result = 'recovered';`,
      );
    });

    await expect(loadNodeEsmScript(remoteEntryUrl)).rejects.toThrow(
      'transient evaluation failure',
    );

    await expect(
      loadNodeEsmScript<{ result: string }>(remoteEntryUrl),
    ).resolves.toMatchObject({ result: 'recovered' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('rejects absolute non-http module URLs without fetching them', async () => {
    const remoteEntryUrl = 'http://example.com/server/remoteEntry.js';
    const fileChunkUrl = 'file:///tmp/chunk.mjs';
    const fetchMock = setRemoteEntryFetchMock(
      remoteEntryUrl,
      moduleSource`
        import value from '${fileChunkUrl}';

        export default value;
      `,
    );

    await expect(loadNodeEsmScript(remoteEntryUrl)).rejects.toThrow(
      `Unsupported ESM module specifier "${fileChunkUrl}"`,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(remoteEntryUrl);
    expect(fetchMock).not.toHaveBeenCalledWith(fileChunkUrl);
  });

  it('rejects bare non-builtin imports instead of fetching them as relative chunks', async () => {
    const remoteEntryUrl = 'http://example.com/server/remoteEntry.js';
    const fetchMock = setRemoteEntryFetchMock(
      remoteEntryUrl,
      moduleSource`
        import React from 'react';

        export default React;
      `,
    );

    await expect(loadNodeEsmScript(remoteEntryUrl)).rejects.toThrow(
      'Unsupported ESM module specifier "react"',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(remoteEntryUrl);
  });

  it('preserves invalid Node script URLs as validation errors', async () => {
    const fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const error = await loadNodeScript('not a valid URL').catch(
      (reason) => reason,
    );

    expect(error.name).toBe('TypeError');
    expect(error.message).toContain('Invalid URL');
    expect(error.name).not.toBe('ScriptNetworkError');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('marks Node script fetch failures as ScriptNetworkError', async () => {
    const fetchMock = jest
      .fn()
      .mockRejectedValue(new TypeError('fetch failed'));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(loadNodeScript()).rejects.toMatchObject({
      name: 'ScriptNetworkError',
    });
  });

  it('marks non-success Node script responses as ScriptNetworkError', async () => {
    const response = createResponse('<html>Not Found</html>', {
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });
    const textMock = jest.spyOn(response, 'text');
    const fetchMock = setFetchMock(() => response);

    await expect(loadNodeScript()).rejects.toMatchObject({
      name: 'ScriptNetworkError',
      message: expect.stringContaining('HTTP 404 Not Found'),
    });
    expect(fetchMock).toHaveBeenCalledWith(DEFAULT_REMOTE_ENTRY_URL);
    expect(textMock).not.toHaveBeenCalled();
  });

  it('marks non-success ESM responses as ScriptNetworkError', async () => {
    const response = createResponse('<html>Server Error</html>', {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });
    const textMock = jest.spyOn(response, 'text');
    const fetchMock = setFetchMock(() => response);

    await expect(loadNodeEsmScript()).rejects.toMatchObject({
      name: 'ScriptNetworkError',
      message: expect.stringContaining('HTTP 500 Internal Server Error'),
    });
    expect(fetchMock).toHaveBeenCalledWith(DEFAULT_REMOTE_ENTRY_URL);
    expect(textMock).not.toHaveBeenCalled();
  });

  it('marks Node script execution failures as ScriptExecutionError', async () => {
    setRemoteEntryFetchMock(
      DEFAULT_REMOTE_ENTRY_URL,
      `throw new TypeError('execution failed');`,
    );

    await expect(loadNodeScript()).rejects.toMatchObject({
      name: 'ScriptExecutionError',
    });
  });
});
