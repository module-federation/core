import { assert, describe, it } from '@rstest/core';
import { ModuleFederation } from '../src';
import { getGlobalSnapshot, resetFederationGlobalInfo } from '../src/global';

describe('snapshot', () => {
  beforeEach(() => {
    resetFederationGlobalInfo();
  });

  it('The host snapshot is automatically completed', async () => {
    const Remote1Entry =
      'http://localhost:1111/resources/snapshot/remote1/federation-manifest.json';
    const Remote2Entry =
      'http://localhost:1111/resources/snapshot/remote2/federation-manifest.json';
    const FM1 = new ModuleFederation({
      name: '@snapshot/host',
      version: '0.0.3',
      remotes: [
        {
          name: '@snapshot/remote1',
          entry: Remote1Entry,
        },
        {
          name: '@snapshot/remote2',
          entry: Remote2Entry,
        },
      ],
    });

    const module = await FM1.loadRemote<() => string>('@snapshot/remote1/say');
    assert(module);
    expect(module()).toBe('hello world "@snapshot/remote1"');

    const module2 = await FM1.loadRemote<() => string>('@snapshot/remote2/say');
    assert(module2);
    expect(module2()).toBe('hello world "@snapshot/remote2"');

    const globalSnapshot = getGlobalSnapshot();

    assert(globalSnapshot['@snapshot/host']);
    expect(globalSnapshot['@snapshot/host']).toMatchObject({
      version: '0.0.3',
      remotesInfo: {
        '@snapshot/remote1': { matchedVersion: Remote1Entry },
        '@snapshot/remote2': { matchedVersion: Remote2Entry },
      },
    });
  });

  it('infers an auto public path from the fetched manifest URL', async () => {
    const manifestUrl = '/remote-web/mf-manifest.json';
    const resolvedManifestUrl =
      'https://example.test/remote-web/mf-manifest.json';
    const response = new Response(
      JSON.stringify({
        id: 'catalog',
        name: 'catalog',
        metaData: {
          name: 'catalog',
          publicPath: 'auto',
          type: 'app',
          buildInfo: { buildVersion: '1.0.0' },
          remoteEntry: {
            name: 'catalog.web.lynx.bundle',
            path: '',
            type: 'global',
          },
          types: { name: '', path: '' },
          globalName: 'catalog',
        },
        remotes: [],
        shared: [],
        exposes: [],
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
    Object.defineProperty(response, 'url', { value: resolvedManifestUrl });

    const instance = new ModuleFederation({
      name: 'host',
      remotes: [{ name: 'catalog', entry: manifestUrl }],
      plugins: [
        {
          name: 'resolved-manifest-fetch',
          fetch: async () => response,
        },
      ],
    });

    const { remoteSnapshot } =
      await instance.snapshotHandler.loadRemoteSnapshotInfo({
        moduleInfo: { name: 'catalog', entry: manifestUrl },
      });

    expect(remoteSnapshot).toMatchObject({
      version: manifestUrl,
      publicPath: 'https://example.test/remote-web/',
      remoteEntry: 'catalog.web.lynx.bundle',
    });
  });

  it('uses the requested manifest URL after parse recovery', async () => {
    const manifestUrl = 'https://requested.example/mf-manifest.json';
    const resolvedManifestUrl =
      'https://redirected.example/v2/mf-manifest.json';
    const recoveredManifest = {
      id: 'catalog',
      name: 'catalog',
      metaData: {
        name: 'catalog',
        publicPath: 'auto',
        type: 'app',
        buildInfo: { buildVersion: '1.0.0' },
        remoteEntry: {
          name: 'catalog.web.lynx.bundle',
          path: 'https://requested.example/',
          type: 'global',
        },
        types: { name: '', path: '' },
        globalName: 'catalog',
      },
      remotes: [],
      shared: [],
      exposes: [],
    };
    const response = new Response('invalid manifest');
    Object.defineProperty(response, 'url', { value: resolvedManifestUrl });
    Object.defineProperty(response, 'json', {
      value: async () => {
        throw new Error('invalid manifest');
      },
    });

    const instance = new ModuleFederation({
      name: 'host',
      remotes: [{ name: 'catalog', entry: manifestUrl }],
      plugins: [
        {
          name: 'failed-manifest-fetch',
          fetch: async () => response,
        },
        {
          name: 'manifest-recovery',
          errorLoadRemote: () => recoveredManifest,
        },
      ],
    });

    const { remoteSnapshot } =
      await instance.snapshotHandler.loadRemoteSnapshotInfo({
        moduleInfo: { name: 'catalog', entry: manifestUrl },
      });

    expect(remoteSnapshot).toMatchObject({
      publicPath: 'https://requested.example/',
    });
    expect(remoteSnapshot?.remoteEntry).toContain('requested.example');
  });

  it('retries a manifest after a failed load', async () => {
    const manifestUrl = 'https://retry.example/mf-manifest.json';
    const manifest = {
      id: 'catalog',
      name: 'catalog',
      metaData: {
        name: 'catalog',
        publicPath: 'https://retry.example/',
        type: 'app',
        buildInfo: { buildVersion: '1.0.0' },
        remoteEntry: {
          name: 'catalog.web.lynx.bundle',
          path: '',
          type: 'global',
        },
        types: { name: '', path: '' },
        globalName: 'catalog',
      },
      remotes: [],
      shared: [],
      exposes: [],
    };
    let fetchCount = 0;
    const instance = new ModuleFederation({
      name: 'host',
      remotes: [{ name: 'catalog', entry: manifestUrl }],
      plugins: [
        {
          name: 'manifest-fetch',
          fetch: async () => {
            fetchCount += 1;
            if (fetchCount === 1) {
              throw new Error('temporary failure');
            }
            return new Response(JSON.stringify(manifest), {
              headers: { 'Content-Type': 'application/json' },
            });
          },
        },
      ],
    });

    await expect(
      instance.snapshotHandler.loadRemoteSnapshotInfo({
        moduleInfo: { name: 'catalog', entry: manifestUrl },
      }),
    ).rejects.toThrow('temporary failure');
    expect(
      instance.snapshotHandler.manifestLoading[manifestUrl],
    ).toBeUndefined();

    await expect(
      instance.snapshotHandler.loadRemoteSnapshotInfo({
        moduleInfo: { name: 'catalog', entry: manifestUrl },
      }),
    ).resolves.toMatchObject({
      remoteSnapshot: { globalName: 'catalog' },
    });
    expect(fetchCount).toBe(2);
  });
});
