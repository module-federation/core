import type { WebpackPluginInstance, Compiler } from 'webpack';
import {
  bindLoggerToCompiler,
  infrastructureLogger,
  type moduleFederationPlugin,
} from '@module-federation/sdk';

import type IModuleFederationPlugin from '../lib/container/ModuleFederationPlugin';
import type { ResourceInfo } from '@module-federation/manifest';

import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import path from 'node:path';
import fs from 'node:fs';
import ReactBridgePlugin from '@module-federation/bridge-react-webpack-plugin';

export const PLUGIN_NAME = 'ModuleFederationPlugin';

export default class ModuleFederationPlugin implements WebpackPluginInstance {
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions;
  private _mfPlugin?: IModuleFederationPlugin;
  name: string;

  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this._options = options;
    this.name = PLUGIN_NAME;
  }

  apply(compiler: Compiler) {
    bindLoggerToCompiler(
      infrastructureLogger,
      compiler,
      'EnhancedModuleFederationPlugin',
    );

    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);
    const CoreModuleFederationPlugin =
      require('../lib/container/ModuleFederationPlugin')
        .default as typeof IModuleFederationPlugin;
    this._mfPlugin = new CoreModuleFederationPlugin(this._options);
    this._mfPlugin!.apply(compiler);

    const checkBridgeReactInstalled = () => {
      try {
        const userPackageJsonPath = path.resolve(
          compiler.context,
          'package.json',
        );
        if (fs.existsSync(userPackageJsonPath)) {
          const userPackageJson = JSON.parse(
            fs.readFileSync(userPackageJsonPath, 'utf-8'),
          );
          const userDependencies = {
            ...userPackageJson.dependencies,
            ...userPackageJson.devDependencies,
          };
          return !!userDependencies['@module-federation/bridge-react'];
        }
        return false;
      } catch (error) {
        return false;
      }
    };
    const hasBridgeReact = checkBridgeReactInstalled();

    const shouldEnableBridgePlugin = () => {
      // Priority 1: Explicit enableBridgeRouter configuration
      if (this._options?.bridge?.enableBridgeRouter === true) {
        return true;
      }

      // Priority 2: Explicit disable via enableBridgeRouter:false or disableAlias:true
      if (
        this._options?.bridge?.enableBridgeRouter === false ||
        this._options?.bridge?.disableAlias === true
      ) {
        if (this._options?.bridge?.disableAlias === true) {
          infrastructureLogger.warn(
            '⚠️  [ModuleFederationPlugin] The `disableAlias` option is deprecated and will be removed in a future version.\n' +
              '   Please use `enableBridgeRouter: false` instead:\n' +
              '   {\n' +
              '     bridge: {\n' +
              '       enableBridgeRouter: false  // Use this instead of disableAlias: true\n' +
              '     }\n' +
              '   }',
          );
        }
        return false;
      }

      // Priority 3: Automatic detection based on bridge-react installation
      if (hasBridgeReact) {
        infrastructureLogger.info(
          '💡 [ModuleFederationPlugin] Detected @module-federation/bridge-react in your dependencies.\n' +
            '   For better control and to avoid future breaking changes, please explicitly set:\n' +
            '   {\n' +
            '     bridge: {\n' +
            '       enableBridgeRouter: true  // Explicitly enable bridge router\n' +
            '     }\n' +
            '   }',
        );
        return true;
      }

      return false;
    };

    const enableBridgePlugin = shouldEnableBridgePlugin();

    // When bridge plugin is disabled (router disabled), alias to /base entry
    if (!enableBridgePlugin && hasBridgeReact) {
      compiler.hooks.afterPlugins.tap('BridgeReactBaseAliasPlugin', () => {
        try {
          const path = require('path');
          const fs = require('fs');
          const bridgeReactBasePath = path.resolve(
            compiler.context,
            'node_modules/@module-federation/bridge-react/dist/base.es.js',
          );

          if (!fs.existsSync(bridgeReactBasePath)) {
            infrastructureLogger.warn(
              '⚠️  [ModuleFederationPlugin] bridge-react /base entry not found, falling back to default entry',
            );
            return;
          }

          compiler.options.resolve.alias = {
            ...compiler.options.resolve.alias,
            '@module-federation/bridge-react$': bridgeReactBasePath,
          };
          infrastructureLogger.info(
            '✅ [ModuleFederationPlugin] Router disabled - using /base entry (no react-router-dom)',
          );
        } catch (error) {
          infrastructureLogger.warn(
            '⚠️  [ModuleFederationPlugin] Failed to set /base alias, using default entry',
          );
        }
      });
    }

    if (enableBridgePlugin) {
      new ReactBridgePlugin({
        moduleFederationOptions: this._options,
      }).apply(compiler);
    }
  }
}
