import { withModuleFederation } from './src/utils/with-module-federation-enhanced-rsbuild.js';

import type { RsbuildConfig } from '@rsbuild/core';
import type { moduleFederationPlugin } from '@module-federation/sdk';

export default {
  rsbuildFinal: (
    config: RsbuildConfig,
    options: moduleFederationPlugin.ModuleFederationPluginOptions,
  ) => {
    return withModuleFederation(config, options);
  },
};
export { PLUGIN_NAME } from './src/utils/with-module-federation-enhanced-rsbuild.js';
