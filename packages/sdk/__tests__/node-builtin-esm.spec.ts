import { jest } from '@jest/globals';
import { sep as pathSeparator } from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_REMOTE_ENTRY_URL = 'http://example.com/remoteEntry.js';

const createResponse = (body: string) => ({
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
});

describe('Node entry identity and graph lifetime', () => {
  let getNodeEntryExports: typeof import('../src/node').getNodeEntryExports;
  let loadScriptNode: typeof import('../src/node').loadScriptNode;
  beforeEach(async () => {
    jest.resetModules();
    ({ getNodeEntryExports, loadScriptNode } = await import('../src/node'));
  });

  const key = 'node-entry-identity-container';
  const attrs = { name: 'remote', globalName: key, type: 'commonjs-module' };
  const originalFetch = globalThis.fetch;
  const source = (value: string) =>
    `module.exports = {init() {}, get() { return () => ${JSON.stringify(value)}; }};`;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete (globalThis as any)[key];
  });

  it('returns each execution result when concurrent Node scripts share a global name', async () => {
    globalThis.fetch = jest.fn(async (url: string) => ({
      text: async () => source(url),
    })) as any;
    const urls = ['https://entry.example/v1.js', 'https://entry.example/v2.js'];
    const [first, second] = await Promise.all(
      urls.map((url) => loadScriptNode(url, { attrs })),
    );
    expect((await first.get())()).toBe(urls[0]);
    expect((await second.get())()).toBe(urls[1]);
    expect(first).not.toBe(second);
  });

  it('matches a preload by entry, format and build without adopting another known source', async () => {
    globalThis.fetch = jest.fn(async () => ({
      text: async () => source('v1'),
    })) as any;
    const url = 'https://entry.example/fixed.js';
    const versioned = { ...attrs, buildVersion: 'v1' };
    const loaded = await loadScriptNode(url, { attrs: versioned });
    expect(getNodeEntryExports(url, versioned)).toBe(loaded);
    expect(
      getNodeEntryExports(url, { ...versioned, buildVersion: 'v2' }),
    ).toBeUndefined();
    expect(
      getNodeEntryExports('https://entry.example/other.js', versioned),
    ).toBeUndefined();
    expect(
      getNodeEntryExports(url, { ...versioned, type: 'module' }),
    ).toBeUndefined();
  });

  it('claims a legacy unversioned preload only once and requires provenance for versioned remotes', () => {
    const preload = {
      init() {},
      get() {
        return () => 'preloaded';
      },
    };
    (globalThis as any)[key] = preload;
    expect(
      getNodeEntryExports('https://entry.example/v1.js', {
        ...attrs,
        buildVersion: 'v1',
      }),
    ).toBeUndefined();
    expect(getNodeEntryExports('https://entry.example/v1.js', attrs)).toBe(
      preload,
    );
    expect(
      getNodeEntryExports('https://entry.example/v2.js', attrs),
    ).toBeUndefined();
  });

  it('keeps same-URL ESM entries and their relative modules separate across build versions', async () => {
    const url = 'https://entry.example/esm-fixed.js';
    let version = 'v1';
    const fetch = jest.fn(async (request: string) => ({
      text: async () =>
        request === url
          ? `import {version} from './esm-child.js'; export function init() {} export function get() { return () => version; }`
          : `export const version = ${JSON.stringify(version)};`,
    }));
    globalThis.fetch = fetch as any;
    const first = await loadScriptNode(url, {
      attrs: { ...attrs, type: 'module', buildVersion: 'v1' },
    });
    version = 'v2';
    const second = await loadScriptNode(url, {
      attrs: { ...attrs, type: 'module', buildVersion: 'v2' },
    });
    expect((await first.get())()).toBe('v1');
    expect((await second.get())()).toBe('v2');
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it('retains entry-local cycles and lazy imports after another build loads the same URLs', async () => {
    const url = 'https://entry.example/cyclic-entry.js';
    let version = 'v1';
    const fetch = jest.fn(async (request: string) => ({
      text: async () => {
        if (request === url)
          return `
      import {read} from './cyclic-child.js';
      export const version = ${JSON.stringify(version)};
      export function get() { return () => read(); }
      export async function lazy() { return (await import('./cyclic-child.js')).read(); }
    `;
        return `import {version} from './cyclic-entry.js'; export function read() { return version; }`;
      },
    }));
    globalThis.fetch = fetch as any;
    const first = await loadScriptNode(url, {
      attrs: { ...attrs, type: 'module', buildVersion: 'v1' },
    });
    version = 'v2';
    const second = await loadScriptNode(url, {
      attrs: { ...attrs, type: 'module', buildVersion: 'v2' },
    });
    expect((await first.get())()).toBe('v1');
    expect((await second.get())()).toBe('v2');
    expect(await first.lazy()).toBe('v1');
    expect(await second.lazy()).toBe('v2');
    expect(fetch).toHaveBeenCalledTimes(4);
    // Once the runtime drops its entry promise/global it may execute the same
    // identity again. The SDK must not resurrect its former global ESM graph.
    const fresh = await loadScriptNode(url, {
      attrs: { ...attrs, type: 'module', buildVersion: 'v2' },
    });
    expect(fresh).not.toBe(second);
    expect(fetch).toHaveBeenCalledTimes(6);
  });
});
