import {
  describe,
  it,
  expect,
  rs,
  afterEach,
  beforeAll,
  afterAll,
} from '@rstest/core';

import { ModuleFederation } from '../src/core';
import {
  getRemoteEntry,
  getRemoteEntryUniqueKey,
  getRemoteInfo,
} from '../src/utils/load';
import {
  resetFederationGlobalInfo,
  setGlobalFederationInstance,
} from '../src/global';
import type { RemoteEntryExports } from '../src/type';

// The shared suite uses jsdom. Select the Node target explicitly for this file,
// just as a Node runtime bundle does through DefinePlugin.
const originalTarget = (globalThis as any).ENV_TARGET;
const originalEsm = process.env.IS_ESM_BUILD;
beforeAll(() => {
  (globalThis as any).ENV_TARGET = 'node';
  process.env.IS_ESM_BUILD = 'true';
});
afterAll(() => {
  if (originalTarget === undefined) delete (globalThis as any).ENV_TARGET;
  else (globalThis as any).ENV_TARGET = originalTarget;
  if (originalEsm === undefined) delete process.env.IS_ESM_BUILD;
  else process.env.IS_ESM_BUILD = originalEsm;
});

const globalName = 'shared-node-container';
const originalFetch = globalThis.fetch;
const container = (value: string) =>
  `module.exports = {init() {}, get() { return () => ${JSON.stringify(value)}; }};`;
const info = (entry: string, buildVersion?: string) => ({
  ...getRemoteInfo({
    name: 'remote',
    entry,
    entryGlobalName: globalName,
    type: 'commonjs-module',
  }),
  buildVersion,
});
const host = (name: string) => new ModuleFederation({ name, remotes: [] });
const value = async (entry: unknown) =>
  (await (entry as RemoteEntryExports).get('./value'))();

afterEach(() => {
  resetFederationGlobalInfo();
  globalThis.fetch = originalFetch;
  delete (globalThis as any)[globalName];
});

describe('Node remote entry provenance', () => {
  it('refreshes a shared manifest URL while another host keeps the old container', async () => {
    let version = 'v1';
    const remote = {
      name: 'catalog',
      entry: 'https://entry.example/mf-manifest.json',
    };
    const fetch = rs.fn(async (url: string) =>
      url.endsWith('.json')
        ? new Response(
            JSON.stringify({
              name: 'catalog',
              metaData: {
                buildInfo: { buildVersion: version, buildName: 'catalog' },
                remoteEntry: {
                  name: 'fixed.js',
                  path: '',
                  type: 'commonjs-module',
                },
                globalName,
                publicPath: 'https://entry.example/',
              },
              exposes: [],
              shared: [],
            }),
          )
        : new Response(container(version)),
    );
    globalThis.fetch = fetch as any;
    const consumers = ['a', 'b'].map((name) => {
      const instance = new ModuleFederation({ name, remotes: [{ ...remote }] });
      setGlobalFederationInstance(instance);
      return instance;
    });
    const [a, b] = consumers;
    expect(await a.loadRemote('catalog/first')).toBe('v1');
    expect(await b.loadRemote('catalog/first')).toBe('v1');
    version = 'v2';
    await a.updateRemotes([{ ...remote }]);
    expect(await a.loadRemote('catalog/first')).toBe('v2');
    expect(await b.loadRemote('catalog/another')).toBe('v1');
    expect(
      fetch.mock.calls.filter(([url]) => url === remote.entry),
    ).toHaveLength(2);
  });

  it.each(['sequential', 'concurrent'])(
    'loads distinct factories for %s same-name containers at different URLs',
    async (mode) => {
      const fetch = rs.fn(async (url: string) => ({
        text: async () => container(url),
      }));
      globalThis.fetch = fetch as any;
      const a = info('https://entry.example/first.js', 'v1');
      const b = info('https://entry.example/second.js', 'v2');
      const first = getRemoteEntry({ origin: host('a'), remoteInfo: a });
      if (mode === 'sequential') await first;
      const second = getRemoteEntry({ origin: host('b'), remoteInfo: b });
      expect(await value(await first)).toBe(a.entry);
      expect(await value(await second)).toBe(b.entry);
      expect(fetch).toHaveBeenCalledTimes(2);
    },
  );

  it('isolates pending requests for different builds at the same URL and deduplicates the same build', async () => {
    const resolvers: (() => void)[] = [];
    let generation = 0;
    const fetch = rs.fn(async () => {
      const current = ++generation;
      await new Promise<void>((resolve) => resolvers.push(resolve));
      return { text: async () => container(`v${current}`) };
    });
    globalThis.fetch = fetch as any;
    const a = info('https://entry.example/fixed.js', 'v1');
    const b = info(a.entry, 'v2');
    const first = getRemoteEntry({ origin: host('a'), remoteInfo: a });
    const reused = getRemoteEntry({ origin: host('c'), remoteInfo: a });
    const second = getRemoteEntry({ origin: host('b'), remoteInfo: b });
    await rs.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    resolvers[1]();
    const loadedSecond = await second;
    resolvers[0]();
    const loadedFirst = await first;
    expect(await value(loadedFirst)).toBe('v1');
    expect(await value(loadedSecond)).toBe('v2');
    expect(await reused).toBe(loadedFirst);
    expect(await getRemoteEntry({ origin: host('d'), remoteInfo: b })).toBe(
      loadedSecond,
    );
    expect(getRemoteEntryUniqueKey(a)).not.toBe(getRemoteEntryUniqueKey(b));
    expect(getRemoteEntryUniqueKey(info(a.entry))).toBe(`remote:${a.entry}`);
  });
});
