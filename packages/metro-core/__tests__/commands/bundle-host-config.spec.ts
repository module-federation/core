import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from '@rstest/core';
import type { ConfigT } from 'metro-config';
import type { BundleFederatedHostArgs, Config } from '../../src/commands';
import * as communityPlugin from '../../src/commands/utils/get-community-plugin';

const TEST_CONFIG_STATE = Symbol.for(
  '@module-federation/metro/TestConfigState',
);
const UPDATED_REMOTE = 'cart@https://cdn.example.com/cart.bundle';

type TestConfigState = {
  readonly generation: number;
  readonly remotes: {
    readonly cart: string;
  };
};

type TestMetroConfig = ConfigT & {
  readonly [TEST_CONFIG_STATE]: TestConfigState;
};

const tempRoots: Array<string> = [];
const bundledConfigs: Array<ConfigT> = [];

function hasTestConfigState(config: ConfigT): config is TestMetroConfig {
  return Object.prototype.hasOwnProperty.call(config, TEST_CONFIG_STATE);
}

function getBundledConfig(index: number): TestMetroConfig {
  const config = bundledConfigs.at(index);
  if (!config || !hasTestConfigState(config)) {
    throw new TypeError('Expected a bundled Metro config');
  }
  return config;
}

function createMetroProject(): {
  readonly cfg: Config;
  readonly configPath: string;
} {
  const projectRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), 'mf-metro-config-reuse-'),
  );
  tempRoots.push(projectRoot);

  const configPath = path.join(projectRoot, 'metro.config.js');
  fs.writeFileSync(
    configPath,
    `
let generation = 0;

module.exports = () => {
  generation += 1;
  const remotes = {
    cart: 'cart@http://localhost:8082/cart.bundle',
  };
  global.__METRO_FEDERATION_CONFIG = { remotes };

  return {
    [Symbol.for('@module-federation/metro/TestConfigState')]: {
      generation,
      remotes,
    },
  };
};
`,
  );

  return {
    cfg: {
      root: projectRoot,
      platforms: { ios: {} },
      reactNativePath: path.dirname(
        require.resolve('react-native/package.json'),
      ),
    },
    configPath,
  };
}

function createBundleArgs(configPath: string): BundleFederatedHostArgs {
  return {
    bundleOutput: 'host.bundle',
    config: configPath,
    dev: false,
    entryFile: 'index.js',
    platform: 'ios',
    resetCache: false,
    resetGlobalCache: false,
    sourcemapUseAbsolutePath: false,
    unstableTransformProfile: 'default',
    verbose: false,
  };
}

beforeEach(() => {
  bundledConfigs.length = 0;
  const command = {
    description: 'Test command',
    func: async () => {},
    name: 'test',
    options: [],
  };
  rs.spyOn(communityPlugin, 'getCommunityCliPlugin').mockReturnValue({
    bundleCommand: command,
    startCommand: command,
    unstable_buildBundleWithConfig: async (_args, config) => {
      bundledConfigs.push(config);
    },
  });
  global.__METRO_FEDERATION_HOST_ENTRY_PATH = '/virtual/host-entry.js';
});

afterEach(() => {
  rs.restoreAllMocks();
  Reflect.deleteProperty(global, '__METRO_FEDERATION_CONFIG');
  global.__METRO_FEDERATION_HOST_ENTRY_PATH = undefined;
  global.__METRO_FEDERATION_ORIGINAL_ENTRY_PATH = undefined;
  for (const tempRoot of tempRoots) {
    fs.rmSync(tempRoot, { force: true, recursive: true });
  }
  tempRoots.length = 0;
});

describe('host command Metro config lifecycle', () => {
  it('bundles mutations made to a preloaded config', async () => {
    // Given
    const { cfg, configPath } = createMetroProject();
    const { bundleFederatedHost, loadMetroConfig } =
      await import('../../src/commands');
    const bundleArgs = createBundleArgs(configPath);
    await loadMetroConfig(cfg, {
      config: configPath,
      maxWorkers: bundleArgs.maxWorkers,
      resetCache: bundleArgs.resetCache,
    });
    global.__METRO_FEDERATION_CONFIG.remotes.cart = UPDATED_REMOTE;

    // When
    await bundleFederatedHost([], cfg, bundleArgs);

    // Then
    expect(getBundledConfig(0)[TEST_CONFIG_STATE].remotes.cart).toBe(
      UPDATED_REMOTE,
    );
  });

  it('loads a fresh config for a later host command', async () => {
    // Given
    const { cfg, configPath } = createMetroProject();
    const { bundleFederatedHost, loadMetroConfig } =
      await import('../../src/commands');
    const firstBundleArgs = createBundleArgs(configPath);
    await loadMetroConfig(cfg, {
      config: configPath,
      maxWorkers: firstBundleArgs.maxWorkers,
      resetCache: firstBundleArgs.resetCache,
    });
    await bundleFederatedHost([], cfg, firstBundleArgs);

    // When
    await bundleFederatedHost([], cfg, createBundleArgs(configPath));

    // Then
    expect(getBundledConfig(1)[TEST_CONFIG_STATE].generation).toBe(2);
  });
});
