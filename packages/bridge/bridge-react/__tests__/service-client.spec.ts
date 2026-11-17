import {
  createInstance,
  helpers,
  type ModuleFederation,
} from '@module-federation/enhanced/runtime';
import * as sdk from '@module-federation/sdk';
import { loadServiceClient } from '../src/service/client';
import type { BridgeServiceClient } from '../src/service/protocol';
jest.mock('@module-federation/sdk', () => ({
  ...jest.requireActual('@module-federation/sdk'),
  loadScript: jest.fn(),
}));

const name = 'service_client_fixture';
const snapshot = (buildVersion: string) => ({
  version: `https://service.test/${buildVersion}/mf-manifest.json`,
  buildVersion,
  remoteEntry: 'entry.js',
  remoteEntryType: 'global' as const,
  globalName: name,
  publicPath: `https://service.test/${buildVersion}/`,
  modules: [],
  remotesInfo: {},
  shared: [],
});
afterEach(() => {
  jest.restoreAllMocks();
  helpers.global.resetFederationGlobalInfo();
  delete (globalThis as any)[name];
});

it('releases mount snapshots, plugins and entry promises after the last user unmounts', async () => {
  const parent = createInstance({ name: 'parent', shared: {} });
  const client: BridgeServiceClient = {
    name,
    expose: './App',
    snapshot: snapshot('v2'),
  };
  let producer!: ModuleFederation;
  const factory = () => ({ render() {}, destroy() {} });
  const loading = jest.mocked(sdk.loadScript).mockImplementation(async () => {
    (globalThis as any)[name] = {
      init() {
        producer ||= createInstance({ name, id: `${name}:v2`, remotes: [] });
      },
      get: async () => () => ({ default: factory }),
    };
  });
  const first = await loadServiceClient(client, parent);
  const second = await loadServiceClient(client, parent);
  expect(first.factory).toBe(factory);
  expect(second.factory).toBe(factory);
  expect(loading).toHaveBeenCalledTimes(1);
  const pluginCount = () =>
    producer.options.plugins.filter((p) =>
      p?.name.startsWith('bridge-service-client-snapshots-'),
    ).length;
  expect(pluginCount()).toBe(2);
  first.release();
  expect(pluginCount()).toBe(1);
  expect(Object.keys(globalThis.__GLOBAL_LOADING_REMOTE_ENTRY__)).toHaveLength(
    1,
  );
  second.release();
  second.release();
  expect(pluginCount()).toBe(0);
  expect(Object.keys(globalThis.__GLOBAL_LOADING_REMOTE_ENTRY__)).toHaveLength(
    0,
  );
  expect(
    Object.keys(globalThis.__FEDERATION__.moduleInfo).filter((key) =>
      key.startsWith('bridge_service_client_'),
    ),
  ).toEqual([]);
  expect(
    globalThis.__FEDERATION__.__INSTANCES__.filter((instance) =>
      instance.name.startsWith('bridge_service_client_'),
    ),
  ).toEqual([]);
});

it('selects a dependency added after the initial client description', async () => {
  const parent = createInstance({ name: 'parent', shared: {} });
  const client: BridgeServiceClient = {
    name,
    expose: './App',
    snapshot: snapshot('v1'),
  };
  let producer!: ModuleFederation;
  jest.mocked(sdk.loadScript).mockImplementation(async () => {
    (globalThis as any)[name] = {
      init() {
        producer = createInstance({ name, id: `${name}:v1`, remotes: [] });
      },
      get: async () => () => ({
        default: () => ({ render() {}, destroy() {} }),
      }),
    };
  });
  const loaded = await loadServiceClient(client, parent);
  try {
    const selected = snapshot('nested-v3');
    client.dependencies = [{ name: 'dynamic', snapshot: selected }];
    const result = await producer.snapshotHandler.loadRemoteSnapshotInfo({
      moduleInfo: { name: 'dynamic', entry: selected.version },
    });
    expect(result.remoteSnapshot.buildVersion).toBe('nested-v3');
    expect(result.remoteSnapshot.version).toBe(selected.version);
  } finally {
    loaded.release();
  }
});
