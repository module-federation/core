import { describe, expect, it } from '@rstest/core';
import { ModuleFederation } from './runtimeTestUtils';
import {
  addGlobalSnapshot,
  getGlobalSnapshot,
} from '../../../runtime-core/src/global';
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
const resolve = async (instance: ModuleFederation) =>
  (
    await instance.remoteHandler.getRemoteModuleAndOptions({
      id: 'catalog/Button',
    })
  ).remoteMatchInfo.remoteInfo;

describe('Node global host snapshots', () => {
  it('publishes global selections and replaces only the updated remote', async () => {
    const instance = new ModuleFederation({
      name: 'node-host',
      remotes: [
        { name: 'catalog', entry: entry('v1') },
        { name: 'account', entry: entry('account') },
      ],
      plugins: [
        {
          name: 'local-manifest',
          fetch: async (url: string) => {
            const version = url.split('/')[3];
            const name = version === 'account' ? 'account' : 'catalog';
            return new Response(
              JSON.stringify({
                ...manifest(version),
                name,
                metaData: { ...manifest(version).metaData, globalName: name },
              }),
            );
          },
          loadEntry: ({ remoteInfo }) => ({
            init() {},
            get: () => () => remoteInfo.buildVersion,
          }),
        },
      ],
    });
    expect(await instance.loadRemote('catalog/Button')).toBe('v1');
    expect(await instance.loadRemote('account/Button')).toBe('account');
    expect(getGlobalSnapshot()['node-host']).toMatchObject({
      remotesInfo: {
        catalog: { matchedVersion: entry('v1') },
        account: { matchedVersion: entry('account') },
      },
    });

    await instance.updateRemotes([{ name: 'catalog', entry: entry('v2') }]);
    expect(getGlobalSnapshot()['node-host'].remotesInfo).toEqual({
      account: { matchedVersion: entry('account') },
    });
    expect(await instance.loadRemote('catalog/Button')).toBe('v2');
    expect(await instance.loadRemote('account/Button')).toBe('account');
    expect(getGlobalSnapshot()['node-host'].remotesInfo).toEqual({
      catalog: { matchedVersion: entry('v2') },
      account: { matchedVersion: entry('account') },
    });
  });

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
    expect(getGlobalSnapshot()['same-host:release']).toBe(template);
    expect(getGlobalSnapshot()['same-host:compiled-build']).toBeUndefined();
  });
});
