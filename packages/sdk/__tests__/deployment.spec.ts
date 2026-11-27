/**
 * @jest-environment node
 */
import { describe, expect, it } from '@jest/globals';
import {
  computeDeploymentSnapshot,
  createDeploymentClient,
  createDiscoveryHandler,
  createMemoryDeploymentStore,
  DeploymentSnapshotExpiredError,
  resolveManifest,
  SNAPSHOT_EXPIRED_CODE,
} from '../src/deployment';
import type { Manifest } from '../src/types';

function makeManifest(options: {
  name: string;
  buildVersion: string;
  publicPath?: string;
  exposes?: Array<{ name: string; path: string }>;
  remotes?: Array<{ name: string; entry: string }>;
}): Manifest {
  return {
    id: options.name,
    name: options.name,
    metaData: {
      name: options.name,
      type: 'app',
      buildInfo: {
        buildVersion: options.buildVersion,
        buildName: options.name,
      },
      remoteEntry: {
        name: 'remoteEntry.js',
        path: '',
        type: 'global',
      },
      types: { path: '', name: '', zip: '', api: '' },
      globalName: options.name,
      pluginVersion: '2.0.0',
      publicPath: options.publicPath ?? 'auto',
    },
    shared: [],
    remotes: (options.remotes || []).map((remote) => ({
      federationContainerName: remote.name,
      moduleName: remote.name,
      alias: remote.name,
      entry: remote.entry,
    })),
    exposes: (options.exposes || [{ name: 'App', path: './App' }]).map(
      (expose) => ({
        id: `${options.name}:${expose.name}`,
        name: expose.name,
        path: expose.path,
        assets: {
          js: { sync: [], async: [] },
          css: { sync: [], async: [] },
        },
      }),
    ),
  };
}

describe('@module-federation/sdk deployment helpers', () => {
  const manifests: Record<string, Manifest> = {
    'https://cdn.example.com/ui/v1/mf-manifest.json': makeManifest({
      name: 'ui_lib',
      buildVersion: '1.0.0',
      exposes: [{ name: 'Button', path: './Button' }],
    }),
    'https://cdn.example.com/ui/v2/mf-manifest.json': makeManifest({
      name: 'ui_lib',
      buildVersion: '2.0.0',
      exposes: [{ name: 'Button', path: './Button' }],
    }),
    'https://cdn.example.com/shop/v1/mf-manifest.json': makeManifest({
      name: 'shop',
      buildVersion: '1.0.0',
      exposes: [{ name: 'App', path: './App' }],
      remotes: [
        {
          name: 'ui_lib',
          entry: 'https://cdn.example.com/ui/v1/mf-manifest.json',
        },
      ],
    }),
    'https://cdn.example.com/rec/v1/mf-manifest.json': makeManifest({
      name: 'recommendation',
      buildVersion: '1.0.0',
      exposes: [{ name: 'App', path: './App' }],
    }),
    'https://cdn.example.com/rec/v2/mf-manifest.json': makeManifest({
      name: 'recommendation',
      buildVersion: '2.0.0',
      exposes: [{ name: 'App', path: './App' }],
    }),
  };

  const loadManifest = async (url: string) => {
    const found = manifests[url];
    if (!found) throw new Error(`404 manifest: ${url}`);
    return found;
  };

  it('resolveManifest infers auto publicPath from manifestUrl', async () => {
    const resolved = await resolveManifest(
      'https://cdn.example.com/shop/v1/mf-manifest.json',
      { loadManifest },
    );
    expect(resolved.moduleName).toBe('shop');
    expect(
      'publicPath' in resolved.snapshot && resolved.snapshot.publicPath,
    ).toBe('https://cdn.example.com/shop/v1/');
  });

  it('computeDeploymentSnapshot preserves ordinary static dependencies and applies overrides precedence', async () => {
    const snapshot = await computeDeploymentSnapshot(
      {
        consumer: 'portal',
        sid: 'portal-sid-1',
        applications: [
          {
            manifestUrl: 'https://cdn.example.com/shop/v1/mf-manifest.json',
            route: 'shop/*',
            expose: './App',
            children: { source: 'shop-deployment' },
          },
        ],
        overrides: {
          ui_lib: 'https://cdn.example.com/ui/v2/mf-manifest.json',
        },
      },
      { loadManifest },
    );

    expect(snapshot.routes).toEqual([
      {
        route: 'shop/*',
        moduleName: 'shop',
        expose: './App',
        versionOrUrl: 'https://cdn.example.com/shop/v1/mf-manifest.json',
        discoverChildren: true,
      },
    ]);
    // Preserved ordinary static code dependency ui_lib and applied override to v2!
    const shopInfo =
      snapshot.moduleInfo[
        'shop:https://cdn.example.com/shop/v1/mf-manifest.json'
      ];
    expect(
      shopInfo && 'remotesInfo' in shopInfo && shopInfo.remotesInfo,
    ).toEqual({
      ui_lib: {
        matchedVersion: 'https://cdn.example.com/ui/v2/mf-manifest.json',
      },
    });
    expect(
      snapshot.moduleInfo[
        'ui_lib:https://cdn.example.com/ui/v2/mf-manifest.json'
      ],
    ).toBeDefined();
  });

  it('rejects non-existent exposes and duplicate routes', async () => {
    await expect(
      computeDeploymentSnapshot(
        {
          consumer: 'portal',
          applications: [
            {
              manifestUrl: 'https://cdn.example.com/shop/v1/mf-manifest.json',
              route: 'shop/*',
              expose: './DoesNotExist',
            },
          ],
        },
        { loadManifest },
      ),
    ).rejects.toThrow(/Expose "\.\/DoesNotExist" does not exist/);
  });

  it('supports multi-layer discovery, fixed child pinning without drift, transaction staging, sid expiration, and dehydrate/hydrate', async () => {
    const store = createMemoryDeploymentStore();

    // Publish shop child deployment v1
    const shopDepV1 = await computeDeploymentSnapshot(
      {
        consumer: 'shop',
        consumerManifestUrl: 'https://cdn.example.com/shop/v1/mf-manifest.json',
        sid: 'shop-sid-1',
        applications: [
          {
            manifestUrl: 'https://cdn.example.com/rec/v1/mf-manifest.json',
            route: 'recommend/*',
            expose: './App',
            children: false,
          },
        ],
      },
      { loadManifest },
    );
    const shopDepId1 = await store.save('shop-deployment', shopDepV1);
    await store.activate('shop-deployment', shopDepId1);

    // Publish portal referencing shop independently
    const portalDep = await computeDeploymentSnapshot(
      {
        consumer: 'portal',
        sid: 'portal-sid-1',
        applications: [
          {
            manifestUrl: 'https://cdn.example.com/shop/v1/mf-manifest.json',
            route: 'shop/*',
            expose: './App',
            children: { source: 'shop-deployment' },
          },
        ],
      },
      { loadManifest },
    );
    const portalDepId1 = await store.save('portal', portalDep);
    await store.activate('portal', portalDepId1);

    const client = createDeploymentClient({
      rootSource: 'portal',
      readDeployment: (input) => store.read(input),
    });

    // Transaction 1: query portal then shop -> commit
    const rootRes = await client.getApplications({
      consumer: null,
      pathname: '/shop/recommend/detail',
      search: '',
      basename: '/',
      mountId: 'root',
      transactionId: 'tx-1',
    });
    expect(rootRes.routes[0].moduleName).toBe('shop');

    const shopRes = await client.getApplications({
      consumer: {
        moduleName: 'shop',
        expose: './App',
        versionOrUrl: 'https://cdn.example.com/shop/v1/mf-manifest.json',
      },
      pathname: '/shop/recommend/detail',
      search: '',
      basename: '/shop',
      mountId: 'm_shop',
      parentMountId: 'root',
      transactionId: 'tx-1',
    });
    expect(shopRes.routes[0].versionOrUrl).toBe(
      'https://cdn.example.com/rec/v1/mf-manifest.json',
    );
    client.lifecycle.onCommit('tx-1');

    // Dehydrate & hydrate into a fresh browser client
    const dehydrated = client.lifecycle.dehydrate();
    const browserClient = createDeploymentClient({
      rootSource: 'portal',
      readDeployment: (input) => store.read(input),
    });
    browserClient.lifecycle.hydrate(dehydrated);

    // Publish shop v2 -> same-source sid mismatch triggers DeploymentSnapshotExpiredError
    const shopDepV2 = await computeDeploymentSnapshot(
      {
        consumer: 'shop',
        consumerManifestUrl: 'https://cdn.example.com/shop/v1/mf-manifest.json',
        sid: 'shop-sid-2',
        applications: [
          {
            manifestUrl: 'https://cdn.example.com/rec/v2/mf-manifest.json',
            route: 'recommend/*',
            expose: './App',
            children: false,
          },
        ],
      },
      { loadManifest },
    );
    const shopDepId2 = await store.save('shop-deployment', shopDepV2);
    await store.activate('shop-deployment', shopDepId2);

    await expect(
      browserClient.getApplications({
        consumer: {
          moduleName: 'shop',
          expose: './App',
          versionOrUrl: 'https://cdn.example.com/shop/v1/mf-manifest.json',
        },
        pathname: '/shop/recommend/new',
        search: '',
        basename: '/shop',
        mountId: 'm_shop',
        parentMountId: 'root',
        transactionId: 'tx-2',
      }),
    ).rejects.toMatchObject({
      code: SNAPSHOT_EXPIRED_CODE,
      source: 'shop-deployment',
      expectedSid: 'shop-sid-1',
      receivedSid: 'shop-sid-2',
    });

    // Fixed child deployment pinned to shopDepId1 NEVER drifts to v2
    const pinnedPortal = await computeDeploymentSnapshot(
      {
        consumer: 'portal',
        sid: 'portal-sid-pinned',
        applications: [
          {
            manifestUrl: 'https://cdn.example.com/shop/v1/mf-manifest.json',
            route: 'shop/*',
            expose: './App',
            children: {
              source: 'shop-deployment',
              deploymentId: shopDepId1,
            },
          },
        ],
      },
      { loadManifest, readDeployment: (input) => store.read(input) },
    );
    const pinnedId = await store.save('portal-pinned', pinnedPortal);
    await store.activate('portal-pinned', pinnedId);

    const pinnedClient = createDeploymentClient({
      rootSource: 'portal-pinned',
      readDeployment: (input) => store.read(input),
    });
    await pinnedClient.getApplications({
      consumer: null,
      pathname: '/shop/recommend',
      search: '',
      basename: '/',
      mountId: 'root',
      transactionId: 'tx-pin',
    });
    const pinnedShopRes = await pinnedClient.getApplications({
      consumer: {
        moduleName: 'shop',
        expose: './App',
        versionOrUrl: 'https://cdn.example.com/shop/v1/mf-manifest.json',
      },
      pathname: '/shop/recommend',
      search: '',
      basename: '/shop',
      mountId: 'm_shop',
      parentMountId: 'root',
      transactionId: 'tx-pin',
    });
    expect(pinnedShopRes.routes[0].versionOrUrl).toBe(
      'https://cdn.example.com/rec/v1/mf-manifest.json',
    );
    expect(await store.list('shop-deployment')).toHaveLength(2);
  });

  it('createDiscoveryHandler serves deployment responses over standard HTTP Request/Response', async () => {
    const store = createMemoryDeploymentStore();
    const dep = await computeDeploymentSnapshot(
      {
        consumer: 'portal',
        applications: [
          {
            manifestUrl: 'https://cdn.example.com/rec/v1/mf-manifest.json',
            route: 'rec/*',
            expose: './App',
            children: false,
          },
        ],
      },
      { loadManifest },
    );
    const depId = await store.save('portal', dep);
    await store.activate('portal', depId);

    const handler = createDiscoveryHandler({
      rootSource: 'portal',
      readDeployment: (input) => store.read(input),
    });

    const okRes = await handler(
      new Request('https://portal.test/api/discovery?pathname=/rec/detail'),
    );
    expect(okRes.status).toBe(200);
    const payload = (await okRes.json()) as {
      routes: Array<{ moduleName: string }>;
    };
    expect(payload.routes[0].moduleName).toBe('recommendation');

    // Missing pinned deployment returns 409 expired
    const expiredRes = await handler(
      new Request('https://portal.test/api/discovery?deploymentId=missing-dep'),
    );
    expect(expiredRes.status).toBe(409);
    const expiredBody = (await expiredRes.json()) as { code: string };
    expect(expiredBody.code).toBe(SNAPSHOT_EXPIRED_CODE);
    expect(new DeploymentSnapshotExpiredError().code).toBe(
      SNAPSHOT_EXPIRED_CODE,
    );
  });
});
