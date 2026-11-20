/** @jest-environment node */
import { jest } from '@jest/globals';
import { loadScriptNode } from '../src/node';

describe('loadScriptNode fetch hook', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    Reflect.deleteProperty(globalThis, 'fetch_hook_test');
  });

  it('loads the entry and its ESM imports through the fetch hook', async () => {
    const networkFetch = jest.fn<typeof fetch>();
    globalThis.fetch = networkFetch;
    const hook = jest.fn(
      async ([url]: [string, RequestInit]) =>
        new Response(
          url.endsWith('entry.mjs')
            ? "export { value } from './chunk.mjs';"
            : "export const value = 'hook response';",
        ),
    );

    await loadScriptNode('http://fetch-hook.test/entry.mjs', {
      attrs: { type: 'module', globalName: 'fetch_hook_test' },
      loaderHook: { fetch: hook },
    });

    expect(Reflect.get(globalThis, 'fetch_hook_test').value).toBe(
      'hook response',
    );
    expect(hook.mock.calls).toEqual([
      [['http://fetch-hook.test/entry.mjs', {}]],
      [['http://fetch-hook.test/chunk.mjs', {}]],
    ]);
    expect(networkFetch).not.toHaveBeenCalled();
  });

  it('falls back to native fetch when the hook returns nothing', async () => {
    const networkFetch = jest
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response("module.exports = { value: 'network response' };"),
      );
    globalThis.fetch = networkFetch;

    await loadScriptNode('http://fetch-hook.test/fallback.js', {
      attrs: { globalName: 'fetch_hook_test' },
      loaderHook: { fetch: () => undefined },
    });

    expect(Reflect.get(globalThis, 'fetch_hook_test').value).toBe(
      'network response',
    );
    expect(networkFetch).toHaveBeenCalledWith(
      'http://fetch-hook.test/fallback.js',
      {},
    );
  });
});
