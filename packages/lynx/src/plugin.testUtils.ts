import { rs } from '@rstest/core';

import { pluginLynxModuleFederation } from './plugin';
import type {
  LynxModuleFederationAdapterOptions,
  LynxModuleFederationOptions,
} from './plugin';

export const LAYERS = {
  BACKGROUND: 'background',
  MAIN_THREAD: 'main-thread',
};

type ModifyRspackConfig = (config: any, context: any) => any;
type ModifyEnvironmentConfig = (config: any, context: any) => any;
type ModifyBundlerChain = (chain: any, context: any) => any;
type BundlerChainPluginUse = [
  unknown,
  Array<{
    setupListTransformer: (setupList: unknown[]) => unknown;
  }>,
];
type ReactResolver = {
  resolve(request: string): Promise<string>;
};

export const setupPlugin = (
  options: LynxModuleFederationOptions,
  adapterOptions?: LynxModuleFederationAdapterOptions,
  layers: unknown = LAYERS,
  reactResolver?: ReactResolver,
) => {
  let modifyRspackConfig: ModifyRspackConfig | undefined;
  let modifyEnvironmentConfigCallback: ModifyEnvironmentConfig | undefined;
  let modifyBundlerChainCallback: ModifyBundlerChain | undefined;
  const bundlerPluginUses = new Map<string, BundlerChainPluginUse>();
  const chain = {
    plugin(name: string) {
      return {
        use(Plugin: unknown, args: BundlerChainPluginUse[1]) {
          bundlerPluginUses.set(name, [Plugin, args]);
        },
      };
    },
  };
  const modifyEnvironmentConfig = rs.fn((callback: ModifyEnvironmentConfig) => {
    modifyEnvironmentConfigCallback = callback;
  });
  const plugin = pluginLynxModuleFederation(options, adapterOptions);

  plugin.setup!({
    modifyEnvironmentConfig,
    modifyBundlerChain(callback: ModifyBundlerChain) {
      modifyBundlerChainCallback = callback;
    },
    modifyRspackConfig(callback: ModifyRspackConfig) {
      modifyRspackConfig = callback;
    },
    useExposed(symbol: symbol) {
      if (symbol === Symbol.for('LAYERS')) {
        return layers;
      }
      if (symbol === Symbol.for('@lynx-js/react/internal:resolve')) {
        return reactResolver;
      }
      return undefined;
    },
  } as any);

  return {
    modifyEnvironmentConfig,
    bundlerPluginUses,
    applyEnvironmentConfig: (config: any, environment = 'lynx') =>
      modifyEnvironmentConfigCallback!(config, { name: environment }),
    modifyBundlerChain: (environment = 'lynx') =>
      modifyBundlerChainCallback!(chain, {
        environment: { name: environment },
      }),
    modifyRspackConfig: (config: any, environment = 'lynx') =>
      modifyRspackConfig!(config, { environment: { name: environment } }),
  };
};

export const federationOptions = (plugin: unknown) => (plugin as any)._options;
