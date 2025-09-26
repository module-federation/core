import type { moduleFederationPlugin } from '@module-federation/sdk';
import { getBridgeRouterAlias } from './utis';

class ReactBridgeAliasChangerPlugin {
  alias: string;
  targetFile: string;
  moduleFederationOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
  constructor(info: {
    moduleFederationOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
  }) {
    this.moduleFederationOptions = info.moduleFederationOptions;
    this.alias = 'react-router-dom$';
    this.targetFile = '@module-federation/bridge-react/dist/router.es.js';

    if (this.moduleFederationOptions.shared) {
      if (Array.isArray(this.moduleFederationOptions.shared)) {
        if (this.moduleFederationOptions.shared.includes('react-router-dom')) {
          throw Error(
            'React-router-dom cannot be set to shared after react bridge is used',
          );
        }
      } else {
        if (this.moduleFederationOptions.shared['react-router-dom']) {
          throw Error(
            'React-router-dom cannot be set to shared after react bridge is used',
          );
        }
      }
    }
  }

  apply(compiler: any) {
    compiler.hooks.afterEnvironment.tap('ReactBridgeAliasPlugin', () => {
      const originalResolve = compiler.options.resolve || {};
      const originalAlias = originalResolve.alias || {};
      const updatedAlias = {
        ...getBridgeRouterAlias(originalAlias['react-router-dom']),
        ...originalAlias,
      };

      compiler.options.resolve = {
        ...originalResolve,
        alias: updatedAlias,
      };
    });
  }
}

export default ReactBridgeAliasChangerPlugin;
