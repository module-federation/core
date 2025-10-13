import type { WebpackPluginInstance, Compiler } from 'webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';
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
          console.warn(
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
        console.info(
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

    if (shouldEnableBridgePlugin()) {
      new ReactBridgePlugin({
        moduleFederationOptions: this._options,
      }).apply(compiler);
    }
  }

  get statsResourceInfo(): Partial<ResourceInfo> | undefined {
    return this._mfPlugin?.statsResourceInfo;
  }
}
