import { moduleFederationPlugin } from '@module-federation/sdk';

class MockModuleFederationPlugin {}

jest.mock('@module-federation/enhanced/rspack', () => ({
  ModuleFederationPlugin: MockModuleFederationPlugin,
}));

import {
  PLUGIN_NAME,
  withModuleFederation,
} from './with-module-federation-enhanced-rsbuild.js';

const getModuleFederationPluginOptions = async (
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
) => {
  const rsbuildConfig = withModuleFederation({}, options);
  const [plugin] = rsbuildConfig.plugins || [];
  const rsbuildPlugin = plugin as { setup: (api: unknown) => void };

  const use = jest.fn();
  const chain = {
    plugin: jest.fn(() => ({ use })),
  };
  const api = {
    modifyRsbuildConfig: jest.fn(),
    modifyBundlerChain: jest.fn((callback) => callback(chain)),
  };

  rsbuildPlugin.setup(api as never);

  expect(chain.plugin).toHaveBeenCalledWith(PLUGIN_NAME);
  expect(use).toHaveBeenCalledWith(MockModuleFederationPlugin, [
    expect.any(Object),
  ]);

  return use.mock.calls[0][1][0];
};

describe(`${withModuleFederation.name}()`, () => {
  it('passes through advanced Module Federation options for the Rsbuild plugin', async () => {
    const remoteTypeUrls = {
      remote: {
        alias: 'remote',
        api: 'http://localhost:3001/@mf-types.d.ts',
        zip: 'http://localhost:3001/@mf-types.zip',
      },
    };
    const runtimePlugin = './runtime-plugin.js';

    const pluginOptions = await getModuleFederationPluginOptions({
      name: 'storybook-host',
      remotes: {
        remote: 'remote@http://localhost:3001/mf-manifest.json',
      },
      shared: {
        lodash: { singleton: true },
      },
      dts: {
        consumeTypes: {
          remoteTypeUrls,
        },
      },
      manifest: false,
      runtimePlugins: [runtimePlugin],
    });

    expect(pluginOptions).toMatchObject({
      name: 'storybook-host',
      remotes: {
        remote: 'remote@http://localhost:3001/mf-manifest.json',
      },
      dts: {
        consumeTypes: {
          remoteTypeUrls,
        },
      },
      manifest: false,
      runtimePlugins: [runtimePlugin],
    });
    expect(pluginOptions.shared).toMatchObject({
      react: { singleton: true },
      'react-dom': { singleton: true },
      lodash: { singleton: true },
    });
  });

  it('does not forward Storybook preset metadata into the Rsbuild plugin options', async () => {
    const storybookOptions: moduleFederationPlugin.ModuleFederationPluginOptions & {
      cacheKey: string;
      configDir: string;
      configType: string;
      presets: {
        apply: () => void;
      };
    } = {
      name: 'storybook-host',
      remotes: {
        remote: 'remote@http://localhost:3001/mf-manifest.json',
      },
      cacheKey: 'storybook-cache-key',
      configDir: '.storybook',
      configType: 'DEVELOPMENT',
      presets: {
        apply: () => undefined,
      },
    };

    const pluginOptions =
      await getModuleFederationPluginOptions(storybookOptions);

    expect(pluginOptions).toMatchObject({
      name: 'storybook-host',
      remotes: {
        remote: 'remote@http://localhost:3001/mf-manifest.json',
      },
    });
    expect(pluginOptions).not.toHaveProperty('cacheKey');
    expect(pluginOptions).not.toHaveProperty('configDir');
    expect(pluginOptions).not.toHaveProperty('configType');
    expect(pluginOptions).not.toHaveProperty('presets');
  });
});
