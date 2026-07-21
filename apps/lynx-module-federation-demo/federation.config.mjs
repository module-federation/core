import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { pluginLynxModuleFederation } from '@module-federation/lynx';

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const implementation = require.resolve('@module-federation/runtime-tools');

export const sharedStateRequest = 'orbit-shared-state';

export const resolveOutputRoot = (name) =>
  process.env.LYNX_OUTPUT_ROOT
    ? path.resolve(process.env.LYNX_OUTPUT_ROOT, name)
    : `dist/${name}`;

export const resolveAliases = {
  [sharedStateRequest]: path.resolve(
    appRoot,
    'src/shared-app/federationState.ts',
  ),
};

const singleton = {
  singleton: true,
  requiredVersion: false,
};

export const createAppSharedConfig = () => ({
  [sharedStateRequest]: {
    ...singleton,
    realm: 'background',
  },
});

const createRemoteSharedConfig = () =>
  Object.fromEntries(
    Object.entries(createAppSharedConfig()).map(([name, config]) => [
      name,
      { ...config, import: false },
    ]),
  );

const createFederationOptions = (remotes) => ({
  name: 'orbit_control',
  implementation,
  remotes,
  experiments: { asyncStartup: true },
  shareStrategy: 'loaded-first',
  shared: createAppSharedConfig(),
});

export const createWebHostFederationPlugin = (manifestUrl) =>
  pluginLynxModuleFederation(
    createFederationOptions({ catalog: `catalog@${manifestUrl}` }),
    {
      environment: 'web',
      mainThread: true,
      runtimePluginOptions: { timeout: 15_000 },
    },
  );

export const createNativeHostFederationPlugin = (manifestUrl) =>
  pluginLynxModuleFederation(
    createFederationOptions({ catalog: `catalog@${manifestUrl}` }),
    {
      environment: 'lynx',
      runtimePluginOptions: { timeout: 15_000 },
    },
  );

const createRemoteOptions = () => ({
  name: 'catalog',
  implementation,
  experiments: { asyncStartup: true },
  shareStrategy: 'loaded-first',
  exposes: {
    './ActivityFeed': './src/remote-ui/ActivityFeed.tsx',
    './Card': './src/remote-ui/Card.tsx',
    './Details': './src/remote-ui/Details.tsx',
  },
  shared: createRemoteSharedConfig(),
});

export const createWebRemoteFederationPlugin = () =>
  pluginLynxModuleFederation(createRemoteOptions(), {
    environment: 'web',
    remoteBundle: {
      target: 'web',
      filename: 'catalog.web.lynx.bundle',
      preserveSourceEntryBundles: false,
    },
  });

export const createNativeRemoteFederationPlugin = () =>
  pluginLynxModuleFederation(createRemoteOptions(), {
    environment: 'lynx',
    remoteBundle: {
      target: 'lynx',
      filename: 'catalog.native.lynx.bundle',
      preserveSourceEntryBundles: false,
    },
  });
