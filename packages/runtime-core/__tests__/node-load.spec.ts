/*
 * @rstest-environment node
 */

import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { RUNTIME_008 } from '@module-federation/error-codes';
import { ModuleFederation } from '../src/core';
import { resetFederationGlobalInfo } from '../src/global';
import { getRemoteEntry, getRemoteInfo } from '../src/utils/load';

const ENTRY = 'https://origin.example/remoteEntry.js';
const FALLBACK_ENTRY = 'https://backup.example/remoteEntry.js?retryCount=1';
const REMOTE_ENTRY_SOURCE = `
  module.exports = {
    get() {},
    init() {},
  };
`;

const createResponse = (body: string) => ({
  text: async () => body,
});

describe('getRemoteEntry - Node.js entry loading', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    resetFederationGlobalInfo();
    delete (globalThis as any).remote;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    resetFederationGlobalInfo();
    delete (globalThis as any).remote;
  });

  it('recovers a transport failure through loadEntryError and uses the rewritten entry URL', async () => {
    const fetchMock = rs.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === ENTRY) {
        throw new TypeError('fetch failed');
      }
      if (url === FALLBACK_ENTRY) {
        return createResponse(REMOTE_ENTRY_SOURCE);
      }
      throw new Error(`Unexpected URL: ${url}`);
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const origin = new ModuleFederation({ name: 'test-host', remotes: [] });
    const remoteInfo = getRemoteInfo({ name: 'remote', entry: ENTRY });
    const loadEntryError = rs.fn(
      async ({ getRemoteEntry, globalLoading, uniqueKey }: any) => {
        delete globalLoading[uniqueKey];
        return getRemoteEntry({
          origin,
          remoteInfo,
          getEntryUrl: () => FALLBACK_ENTRY,
        });
      },
    );

    origin.registerPlugins([
      {
        name: 'node-entry-retry-test',
        loadEntryError,
      },
    ]);

    const result = await getRemoteEntry({ origin, remoteInfo });

    expect(result).toEqual(
      expect.objectContaining({
        get: expect.any(Function),
        init: expect.any(Function),
      }),
    );
    expect(loadEntryError).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      ENTRY,
      FALLBACK_ENTRY,
    ]);
  });

  it('normalizes an unrecovered Node transport failure as RUNTIME_008', async () => {
    globalThis.fetch = rs
      .fn()
      .mockRejectedValue(
        new TypeError('fetch failed'),
      ) as unknown as typeof fetch;

    const origin = new ModuleFederation({ name: 'test-host', remotes: [] });
    const remoteInfo = getRemoteInfo({ name: 'remote', entry: ENTRY });

    const error = await getRemoteEntry({ origin, remoteInfo }).catch(
      (reason) => reason,
    );

    expect(error.message).toContain(RUNTIME_008);
    expect(error.message).toContain('fetch failed');
  });

  it('does not retry a Node remote entry execution failure', async () => {
    globalThis.fetch = rs
      .fn()
      .mockResolvedValue(
        createResponse(`throw new TypeError('execution failed');`),
      ) as unknown as typeof fetch;

    const origin = new ModuleFederation({ name: 'test-host', remotes: [] });
    const remoteInfo = getRemoteInfo({ name: 'remote', entry: ENTRY });
    const loadEntryError = rs.fn();

    origin.registerPlugins([
      {
        name: 'node-entry-execution-error-test',
        loadEntryError,
      },
    ]);

    const error = await getRemoteEntry({ origin, remoteInfo }).catch(
      (reason) => reason,
    );

    expect(error.message).toContain('execution failed');
    expect(error.message).toContain('ScriptExecutionError');
    expect(error.message).toContain(RUNTIME_008);
    expect(loadEntryError).not.toHaveBeenCalled();
  });

  it('does not classify createScript hook failures as network errors', async () => {
    globalThis.fetch = rs
      .fn()
      .mockRejectedValue(
        new TypeError('fetch should not be called'),
      ) as unknown as typeof fetch;

    const origin = new ModuleFederation({ name: 'test-host', remotes: [] });
    const remoteInfo = getRemoteInfo({ name: 'remote', entry: ENTRY });
    const loadEntryError = rs.fn();
    const hookError = new Error('createScript hook failed');

    origin.registerPlugins([
      {
        name: 'node-entry-hook-error-test',
        createScript() {
          throw hookError;
        },
        loadEntryError,
      },
    ]);

    const error = await getRemoteEntry({ origin, remoteInfo }).catch(
      (reason) => reason,
    );

    expect(error).toBe(hookError);
    expect(error.message).not.toContain(RUNTIME_008);
    expect(loadEntryError).not.toHaveBeenCalled();
  });
});
