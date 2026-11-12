import { describe, expect, it, rs } from '@rstest/core';
import { ModuleFederation } from '../src';
import {
  addGlobalSnapshot,
  getGlobalSnapshot,
  getHostSnapshotInfo,
} from '../src/global';

const entry = (version: string) =>
  `https://catalog.test/${version}/mf-manifest.json`;
const manifest = (version: string) => ({
  name: 'catalog',
  metaData: {
    buildInfo: { buildVersion: version, buildName: 'catalog' },
    remoteEntry: { name: 'entry.js', path: '', type: 'global' },
    globalName: 'catalog',
    publicPath: `https://catalog.test/${version}/`,
  },
  exposes: [],
  shared: [],
});
function host(version: string, id = '') {
  const fetch = rs.fn(
    async (url: string) =>
      new Response(JSON.stringify(manifest(url.split('/')[3]))),
  );
  const instance = new ModuleFederation({
    name: 'same-host',
    id,
    remotes: [{ name: 'catalog', entry: entry(version) }],
    plugins: [{ name: 'local-manifest', fetch }],
  });
  return { instance, fetch };
}
const resolve = async (instance: ModuleFederation) =>
  (
    await instance.remoteHandler.getRemoteModuleAndOptions({
      id: 'catalog/Button',
    })
  ).remoteMatchInfo.remoteInfo;

describe('instance-owned host snapshots', () => {
  it('does not shadow a provider version snapshot with its consumer state', async () => {
    const provider = new ModuleFederation({
      name: 'catalog',
      id: 'catalog:v1',
      remotes: [{ name: 'other', entry: entry('v2') }],
      plugins: [
        {
          name: 'local-manifest',
          fetch: async () => new Response(JSON.stringify(manifest('v2'))),
        },
      ],
    });
    await provider.remoteHandler.getRemoteModuleAndOptions({
      id: 'other/Button',
    });
    // Existing deployment policy may use the bare provider name plus version.
    addGlobalSnapshot({ catalog: { version: 'v1', remoteEntry: entry('v1') } });
    const consumer = new ModuleFederation({
      name: 'version-consumer',
      remotes: [{ name: 'catalog', version: 'v1' }],
      plugins: [
        {
          name: 'local-manifest',
          fetch: async () => new Response(JSON.stringify(manifest('v1'))),
        },
      ],
    });
    expect(await resolve(consumer)).toMatchObject({
      buildVersion: 'v1',
      entry: 'https://catalog.test/v1/entry.js',
    });
  });

  it.each([true, false])(
    'keeps sequential same-name hosts separate with explicit build ID: %s',
    async (withId) => {
      const a = host('v1', withId ? 'same-host:a' : '');
      expect(await resolve(a.instance)).toMatchObject({
        buildVersion: 'v1',
        version: entry('v1'),
        entry: 'https://catalog.test/v1/entry.js',
      });
      // Construct B only after A has written its mutable global host record.
      const b = host('v2', withId ? 'same-host:b' : '');
      expect(await resolve(b.instance)).toMatchObject({
        buildVersion: 'v2',
        version: entry('v2'),
        entry: 'https://catalog.test/v2/entry.js',
      });
      expect(b.fetch).toHaveBeenCalledWith(
        entry('v2'),
        {},
        expect.anything(),
        expect.anything(),
      );
      expect(a.instance.moduleInfo).not.toBe(b.instance.moduleInfo);
      expect(
        getHostSnapshotInfo(a.instance)?.remotesInfo.catalog.matchedVersion,
      ).toBe(entry('v1'));
      expect(
        getHostSnapshotInfo(b.instance)?.remotesInfo.catalog.matchedVersion,
      ).toBe(entry('v2'));
      const bSnapshot = b.instance.moduleInfo;
      await a.instance.destroy();
      expect(getHostSnapshotInfo(b.instance)).toBe(bSnapshot);
      expect(getGlobalSnapshot()[withId ? 'same-host:b' : 'same-host']).toBe(
        bSnapshot,
      );
      expect(await resolve(b.instance)).toMatchObject({ buildVersion: 'v2' });
      await b.instance.destroy();
      expect(
        getGlobalSnapshot()[withId ? 'same-host:b' : 'same-host'],
      ).toBeUndefined();
    },
  );

  it('clones explicit templates without sharing runtime-added remote selections', async () => {
    const template = {
      version: '',
      remoteEntry: '',
      remotesInfo: { preconfigured: { matchedVersion: 'preset' } },
    };
    addGlobalSnapshot({ 'same-host': template });
    const a = host('v1');
    await resolve(a.instance);
    expect(template.remotesInfo).toEqual({
      preconfigured: { matchedVersion: 'preset' },
    });
    const b = host('v2');
    await resolve(b.instance);
    expect(getHostSnapshotInfo(b.instance)?.remotesInfo).toEqual({
      preconfigured: { matchedVersion: 'preset' },
      catalog: { matchedVersion: entry('v2') },
    });
    expect(
      getHostSnapshotInfo(a.instance)?.remotesInfo.catalog.matchedVersion,
    ).toBe(entry('v1'));
  });

  it('uses only the exact build template and leaves injected objects unchanged', async () => {
    const unrelated = {
      version: '',
      remoteEntry: '',
      remotesInfo: { catalog: { matchedVersion: entry('v1') } },
    };
    const exact = {
      version: '',
      remoteEntry: '',
      remotesInfo: { preconfigured: { matchedVersion: 'preset' } },
    };
    addGlobalSnapshot({ 'same-host': unrelated, 'same-host:b': exact });
    const b = host('v2', 'same-host:b');
    expect(await resolve(b.instance)).toMatchObject({ buildVersion: 'v2' });
    expect(b.instance.moduleInfo).not.toBe(exact);
    expect(exact.remotesInfo).toEqual({
      preconfigured: { matchedVersion: 'preset' },
    });
    expect(getGlobalSnapshot()['same-host']).toBe(unrelated);
  });

  it('keeps legacy name/version deployment templates for compiled hosts', async () => {
    const template = {
      version: 'release',
      remoteEntry: '',
      remotesInfo: { catalog: { matchedVersion: entry('v1') } },
    };
    addGlobalSnapshot({ 'same-host:release': template });
    const instance = new ModuleFederation({
      name: 'same-host',
      version: 'release',
      id: 'same-host:compiled-build',
      remotes: [{ name: 'catalog', entry: entry('v2') }],
      plugins: [
        {
          name: 'local-manifest',
          fetch: async (url: string) =>
            new Response(JSON.stringify(manifest(url.split('/')[3]))),
        },
      ],
    });
    // Explicit deployment policy still overrides a bundled registration.
    addGlobalSnapshot({
      [`catalog:${entry('v1')}`]: {
        ...manifest('v1').metaData,
        version: entry('v1'),
        buildVersion: 'v1',
        remoteEntry: 'entry.js',
        remoteEntryType: 'global',
        shared: [],
        modules: [],
        remotesInfo: {},
      } as any,
    });
    expect(await resolve(instance)).toMatchObject({ buildVersion: 'v1' });
    expect(instance.moduleInfo).not.toBe(template);
    expect(getGlobalSnapshot()['same-host:release']).toBe(template);
    expect(getGlobalSnapshot()['same-host:compiled-build']).toBe(
      instance.moduleInfo,
    );
  });
});
