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

  it('does not forward Storybook metadata into the Rsbuild plugin options', async () => {
    // Keys Storybook injects into the `Options` object passed to `rsbuildFinal`.
    // The enhanced ModuleFederationPlugin schema is strict
    // (`additionalProperties: false`), so any of these leaking through would
    // fail validation and break Storybook startup.
    const storybookMetadata = {
      cacheKey: 'storybook-cache-key',
      configDir: '.storybook',
      configType: 'DEVELOPMENT',
      presets: { apply: () => undefined },
      presetsList: [],
      cache: {},
      features: {},
      packageJson: { name: 'host' },
      port: 6006,
      outputDir: 'storybook-static',
      // An unknown/unrecognized key must also be dropped, since the schema
      // rejects additional properties.
      futureStorybookOption: { enabled: true },
    };
    const storybookOptions = {
      name: 'storybook-host',
      remotes: {
        remote: 'remote@http://localhost:3001/mf-manifest.json',
      },
      ...storybookMetadata,
    } as unknown as moduleFederationPlugin.ModuleFederationPluginOptions;

    const pluginOptions =
      await getModuleFederationPluginOptions(storybookOptions);

    expect(pluginOptions).toMatchObject({
      name: 'storybook-host',
      remotes: {
        remote: 'remote@http://localhost:3001/mf-manifest.json',
      },
    });

    for (const key of Object.keys(storybookMetadata)) {
      expect(pluginOptions).not.toHaveProperty(key);
    }
  });
});
