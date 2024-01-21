import { createUnplugin } from 'unplugin';
import { FederatedTypesPluginOptions } from './types';
import { FederatedTypesPlugin } from './plugins/FederatedTypesPlugin';

export const FederatedTypes = createUnplugin(
  (options: FederatedTypesPluginOptions) => {
    return {
      name: 'FederatedTypes',
      webpack: (compiler) => {
        const federatedTypesPlugin = new FederatedTypesPlugin(options);
        federatedTypesPlugin.apply(compiler);
      },
      rspack: (compiler) => {
        const federatedTypesPlugin = new FederatedTypesPlugin(options);
        federatedTypesPlugin.apply(compiler);
      },
    };
  },
);
