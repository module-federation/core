import fs from 'node:fs';
import path from 'node:path';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import { getBridgeRouterAlias } from './router-alias';

export type ReactBridgePluginOptions = {
  moduleFederationOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
  /**
   * Prints router alias debug logs when true.
   * Falls back to `moduleFederationOptions.bridge.showBridgeRouterLogs` when omitted.
   *
   * @default false
   */
  showBridgeRouterLogs?: boolean;
};

class ReactBridgeAliasChangerPlugin {
  alias: string;
  targetFile: string;
  showBridgeRouterLogs: boolean;
  moduleFederationOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
  constructor(info: ReactBridgePluginOptions) {
    this.moduleFederationOptions = info.moduleFederationOptions;
    this.showBridgeRouterLogs =
      info.showBridgeRouterLogs ??
      info.moduleFederationOptions?.bridge?.showBridgeRouterLogs ??
      false;
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
      // Gets the path to the node_modules directory
      const nodeModulesPath = path.resolve(compiler.context, 'node_modules');
      const targetFilePath = path.join(nodeModulesPath, this.targetFile);

      if (fs.existsSync(targetFilePath)) {
        const originalResolve = compiler.options.resolve || {};
        const originalAlias = originalResolve.alias || {};

        // Update alias - set up router version alias
        const updatedAlias: Record<string, string> = {
          // allow `alias` can be override
          // [this.alias]: targetFilePath,
          ...getBridgeRouterAlias(originalAlias['react-router-dom'], {
            showBridgeRouterLogs: this.showBridgeRouterLogs,
          }),
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
