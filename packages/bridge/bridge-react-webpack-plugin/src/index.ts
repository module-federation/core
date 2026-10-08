import fs from 'node:fs';
import path from 'node:path';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import {
  getBridgeRouterAlias,
  shouldGuardSharedReactRouter,
} from './router-alias';

const guardedRouterPackages = ['react-router-dom'];

const getAliasValue = (
  alias: Record<string, string>,
  keys: Array<string>,
): string | undefined => {
  for (const key of keys) {
    if (alias[key]) {
      return alias[key];
    }
  }
  return undefined;
};

const getExactBridgeRouterAlias = (
  alias: Record<string, string>,
): Record<string, string> => {
  const exactAlias: Record<string, string> = {};
  for (const key of Object.keys(alias)) {
    if (key.endsWith('$')) {
      exactAlias[key] = alias[key];
    }
  }
  return exactAlias;
};

const hasSharedPackage = (
  shared: moduleFederationPlugin.ModuleFederationPluginOptions['shared'],
  packageName: string,
): boolean => {
  const matchesPackageRequest = (value: unknown): boolean =>
    typeof value === 'string' &&
    (value === packageName || value.startsWith(`${packageName}/`));

  const sharedValueReferencesPackage = (value: unknown): boolean => {
    if (matchesPackageRequest(value)) {
      return true;
    }

    if (!value || typeof value !== 'object') {
      return false;
    }

    const sharedConfig = value as { import?: unknown; request?: unknown };
    return (
      matchesPackageRequest(sharedConfig.request) ||
      matchesPackageRequest(sharedConfig.import)
    );
  };

  const sharedObjectHasPackage = (sharedObject: Record<string, unknown>) =>
    Object.entries(sharedObject).some(
      ([key, value]) =>
        matchesPackageRequest(key) || sharedValueReferencesPackage(value),
    );

  if (!shared) {
    return false;
  }

  if (Array.isArray(shared)) {
    return shared.some((item) => {
      if (matchesPackageRequest(item)) {
        return true;
      }

      if (item && typeof item === 'object') {
        return sharedObjectHasPackage(item as Record<string, unknown>);
      }

      return false;
    });
  }

  return sharedObjectHasPackage(shared as Record<string, unknown>);
};

const assertRouterPackageNotShared = (
  shared: moduleFederationPlugin.ModuleFederationPluginOptions['shared'],
  packageName: string,
) => {
  if (hasSharedPackage(shared, packageName)) {
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
          reactRouterAlias: getAliasValue(originalAlias, [
            'react-router',
            'react-router$',
            'react-router/dom$',
          ]),
          reactRouterDomAlias: getAliasValue(originalAlias, [
            'react-router-dom',
            'react-router-dom$',
          ]),
        };

        if (shouldGuardSharedReactRouter(routerAliasOptions)) {
          assertRouterPackageNotShared(
            this.moduleFederationOptions.shared,
            'react-router',
          );
        }

        // Update alias - set up router version alias
        const bridgeRouterAlias = getBridgeRouterAlias(routerAliasOptions);
        const updatedAlias: Record<string, string> = {
          ...bridgeRouterAlias,
          ...originalAlias,
          // Keep exact router entrypoints on the bridge proxies.
          ...getExactBridgeRouterAlias(bridgeRouterAlias),
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
