import fs from 'node:fs';
import path from 'node:path';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import {
  getBridgeRouterAlias,
  shouldGuardSharedReactRouter,
} from './router-alias';

const guardedRouterPackages = ['react-router-dom'];

const assertRouterPackageNotShared = (
  shared: moduleFederationPlugin.ModuleFederationPluginOptions['shared'],
  packageName: string,
) => {
  if (!shared) {
    return;
  }

  if (Array.isArray(shared)) {
    if (shared.includes(packageName)) {
      throw Error(
        `${packageName} cannot be set to shared after react bridge is used`,
      );
    }
    return;
  }

  if (shared[packageName]) {
    throw Error(
      `${packageName} cannot be set to shared after react bridge is used`,
    );
  }
};

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
      for (const packageName of guardedRouterPackages) {
        assertRouterPackageNotShared(
          this.moduleFederationOptions.shared,
          packageName,
        );
      }
    }
  }

  apply(compiler: any) {
    compiler.hooks.afterEnvironment.tap('ReactBridgeAliasPlugin', () => {
      // Gets the path to the node_modules directory
      const nodeModulesPath = path.resolve(compiler.context, 'node_modules');
      const targetFilePath = path.join(nodeModulesPath, this.targetFile);

      if (fs.existsSync(targetFilePath)) {
        const originalResolve = compiler.options.resolve || {};
        const originalAlias = originalResolve.alias || {};
        const routerAliasOptions = {
          reactRouterAlias: originalAlias['react-router'],
          reactRouterDomAlias: originalAlias['react-router-dom'],
        };

        if (shouldGuardSharedReactRouter(routerAliasOptions)) {
          assertRouterPackageNotShared(
            this.moduleFederationOptions.shared,
            'react-router',
          );
        }

        // Update alias - set up router version alias
        const updatedAlias: Record<string, string> = {
          // allow `alias` can be override
          // [this.alias]: targetFilePath,
          ...getBridgeRouterAlias(routerAliasOptions),
          ...originalAlias,
        };

        // Update the webpack configuration
        compiler.options.resolve = {
          ...originalResolve,
          alias: updatedAlias,
        };
      }
    });
  }
}

export default ReactBridgeAliasChangerPlugin;
