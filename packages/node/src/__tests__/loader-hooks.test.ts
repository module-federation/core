import { MessageChannel } from 'node:worker_threads';
import type { LoadHookContext, ResolveHookContext } from 'node:module';
import {
  initialize,
  load,
  resolve,
  isOriginAllowed,
  hostFallbackParentURL,
  resetNativeHttpLoaderStateForTesting,
} from '../loader-hooks/hooks';
import {
  ACK_MESSAGE,
  ADD_ORIGIN_MESSAGE,
  isHttpUrl,
  normalizeOrigin,
  getNativeHttpLoaderState,
  setNativeHttpLoaderState,
  clearNativeHttpLoaderStateForTesting,
} from '../loader-hooks/protocol';
import { loadEntryViaNativeHttpLoader } from '../loader-hooks/entryLoader';
import type { NativeHttpLoaderState } from '../loader-hooks/protocol';

const ORIGIN = 'http://remotes.example.com';
const ENTRY_URL = `${ORIGIN}/static/remoteEntry.js`;

const nextResolve = jest.fn();
const nextLoad = jest.fn();

const originalFetch = global.fetch;

afterEach(() => {
  resetNativeHttpLoaderStateForTesting();
  clearNativeHttpLoaderStateForTesting();
  global.fetch = originalFetch;
  jest.clearAllMocks();
});

function mockFetchResponse(
  body: string,
  init: {
    ok?: boolean;
    status?: number;
    contentType?: string | null;
  } = {},
): jest.Mock {
  const { ok = true, status = 200, contentType = 'text/javascript' } = init;
  const fetchMock = jest.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Not Found',
    text: jest.fn().mockResolvedValue(body),
    headers: { get: () => contentType },
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe('protocol helpers', () => {
  it('detects http(s) URLs', () => {
    expect(isHttpUrl('http://a.com/x.js')).toBe(true);
    expect(isHttpUrl('https://a.com/x.js')).toBe(true);
    expect(isHttpUrl('file:///x.js')).toBe(false);
    expect(isHttpUrl('./relative.js')).toBe(false);
    expect(isHttpUrl(undefined)).toBe(false);
  });

  it('normalizes URLs to their origin', () => {
    expect(normalizeOrigin('https://a.com:8080/deep/path.js')).toBe(
      'https://a.com:8080',
    );
    expect(() => normalizeOrigin('not a url')).toThrow();
  });
});

describe('loader hooks: initialize', () => {
  it('seeds the allowlist and ignores malformed entries', () => {
    initialize({ allowedOrigins: [ORIGIN, 'not a url'] });
    expect(isOriginAllowed(ENTRY_URL)).toBe(true);
    expect(isOriginAllowed('https://other.example.com/x.js')).toBe(false);
  });

  it('accepts allowlist updates over the message port and acks them', async () => {
    const { port1, port2 } = new MessageChannel();
    initialize({ allowedOrigins: [], port: port2 });

    const ack = new Promise((resolveAck) => {
      port1.on('message', resolveAck);
    });
    port1.postMessage({ id: 7, type: ADD_ORIGIN_MESSAGE, origin: ORIGIN });

    await expect(ack).resolves.toEqual({ id: 7, type: ACK_MESSAGE });
    expect(isOriginAllowed(ENTRY_URL)).toBe(true);
    port1.close();
  });
});

describe('loader hooks: resolve', () => {
  const context: ResolveHookContext = {
    conditions: [],
    importAssertions: {},
    importAttributes: {},
    parentURL: undefined,
  };

  it('short-circuits allowed http specifiers', async () => {
    initialize({ allowedOrigins: [ORIGIN] });
    await expect(resolve(ENTRY_URL, context, nextResolve)).resolves.toEqual({
      url: ENTRY_URL,
      shortCircuit: true,
    });
    expect(nextResolve).not.toHaveBeenCalled();
  });

  it('rejects http specifiers from origins outside the allowlist', async () => {
    await expect(
      resolve('http://evil.example.com/x.js', context, nextResolve),
    ).rejects.toThrow(/not in the.*allowlist/s);
  });

  it('resolves relative imports against an http parent and enforces the allowlist', async () => {
    initialize({ allowedOrigins: [ORIGIN] });
    await expect(
      resolve('./chunk.js', { ...context, parentURL: ENTRY_URL }, nextResolve),
    ).resolves.toEqual({
      url: `${ORIGIN}/static/chunk.js`,
      shortCircuit: true,
    });

    await expect(
      resolve(
        './chunk.js',
        { ...context, parentURL: 'http://evil.example.com/entry.js' },
        nextResolve,
      ),
    ).rejects.toThrow(/allowlist/);
  });

  it('delegates builtin imports from http modules to the default resolver', async () => {
    initialize({ allowedOrigins: [ORIGIN] });
    nextResolve.mockResolvedValue({ url: 'node:path' });
    await resolve(
      'node:path',
      { ...context, parentURL: ENTRY_URL },
      nextResolve,
    );
    expect(nextResolve).toHaveBeenCalledWith('node:path', {
      ...context,
      parentURL: ENTRY_URL,
    });
  });

  it('resolves bare specifiers from http modules against the host application', async () => {
    initialize({ allowedOrigins: [ORIGIN] });
    nextResolve.mockResolvedValue({ url: 'file:///host/node_modules/react' });
    await resolve('react', { ...context, parentURL: ENTRY_URL }, nextResolve);
    expect(nextResolve).toHaveBeenCalledWith('react', {
      ...context,
      parentURL: hostFallbackParentURL(),
    });
  });

  it('passes non-http resolution through untouched', async () => {
    nextResolve.mockResolvedValue({ url: 'file:///app/local.js' });
    await resolve('./local.js', context, nextResolve);
    expect(nextResolve).toHaveBeenCalledWith('./local.js', context);
  });
});

describe('loader hooks: load', () => {
  const context: LoadHookContext = {
    conditions: [],
    format: undefined,
    importAssertions: {},
    importAttributes: {},
  };

  it('passes non-http URLs through to the default loader', async () => {
    nextLoad.mockResolvedValue({ format: 'module', source: '' });
    await load('file:///app/x.js', context, nextLoad);
    expect(nextLoad).toHaveBeenCalledWith('file:///app/x.js', context);
  });

  it('fetches allowed http modules and returns ESM source', async () => {
    initialize({ allowedOrigins: [ORIGIN] });
    const fetchMock = mockFetchResponse('export const x = 1;');

    await expect(load(ENTRY_URL, context, nextLoad)).resolves.toEqual({
      format: 'module',
      source: 'export const x = 1;',
      shortCircuit: true,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      ENTRY_URL,
      expect.objectContaining({
        redirect: 'manual',
        signal: expect.any(AbortSignal),
      }),
    );
    expect(nextLoad).not.toHaveBeenCalled();
  });

  it('caches fetched sources per URL', async () => {
    initialize({ allowedOrigins: [ORIGIN] });
    const fetchMock = mockFetchResponse('export const x = 1;');

    await load(ENTRY_URL, context, nextLoad);
    await load(ENTRY_URL, context, nextLoad);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects http URLs outside the allowlist without fetching', async () => {
    const fetchMock = mockFetchResponse('export const x = 1;');
    await expect(load(ENTRY_URL, context, nextLoad)).rejects.toThrow(
      /allowlist/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses to follow redirects from allowlisted origins', async () => {
    initialize({ allowedOrigins: [ORIGIN] });
    const fetchMock = mockFetchResponse('export const stolen = 1;', {
      ok: false,
      status: 302,
    });
    await expect(load(ENTRY_URL, context, nextLoad)).rejects.toThrow(
      /redirect/i,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws a descriptive error on non-OK responses', async () => {
    initialize({ allowedOrigins: [ORIGIN] });
    mockFetchResponse('', { ok: false, status: 404 });
    await expect(load(ENTRY_URL, context, nextLoad)).rejects.toThrow(
      /HTTP 404/,
    );
  });

  it('infers json format from the content type', async () => {
    initialize({ allowedOrigins: [ORIGIN] });
    mockFetchResponse('{"a":1}', { contentType: 'application/json' });
    await expect(
      load(`${ORIGIN}/manifest.json`, context, nextLoad),
    ).resolves.toMatchObject({ format: 'json' });
  });
});

describe('native loader global state', () => {
  it('stores and clears state on globalThis', () => {
    expect(getNativeHttpLoaderState()).toBeUndefined();
    const state: NativeHttpLoaderState = {
      allowedOrigins: new Set(),
      allowOrigin: jest.fn().mockResolvedValue(undefined),
    };
    setNativeHttpLoaderState(state);
    expect(getNativeHttpLoaderState()).toBe(state);
    clearNativeHttpLoaderStateForTesting();
    expect(getNativeHttpLoaderState()).toBeUndefined();
  });
});

describe('loadEntryViaNativeHttpLoader', () => {
  const remoteInfo = { name: 'app2', entry: ENTRY_URL, type: 'module' };

  function activateState(): NativeHttpLoaderState {
    const state: NativeHttpLoaderState = {
      allowedOrigins: new Set(),
      allowOrigin: jest.fn().mockResolvedValue(undefined),
    };
    setNativeHttpLoaderState(state);
    return state;
  }

  it('returns undefined when the loader hooks were never registered', async () => {
    await expect(loadEntryViaNativeHttpLoader(remoteInfo)).resolves.toBe(
      undefined,
    );
  });

  it('returns undefined for non-http entries', async () => {
    activateState();
    await expect(
      loadEntryViaNativeHttpLoader({
        ...remoteInfo,
        entry: '/local/remoteEntry.js',
      }),
    ).resolves.toBe(undefined);
  });

  it('returns undefined for remote entry formats that need the vm path', async () => {
    const state = activateState();
    for (const type of ['global', 'commonjs-module', 'var', undefined]) {
      await expect(
        loadEntryViaNativeHttpLoader({ ...remoteInfo, type }),
      ).resolves.toBe(undefined);
    }
    expect(state.allowOrigin).not.toHaveBeenCalled();
  });
});
