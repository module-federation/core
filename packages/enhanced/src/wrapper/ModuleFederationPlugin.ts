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

    // react bridge plugin
    const nodeModulesPath = path.resolve(compiler.context, 'node_modules');
    const reactPath = path.join(
      nodeModulesPath,
      '@module-federation/bridge-react',
    );
    // Check whether react exists
    if (
      fs.existsSync(reactPath) &&
      (!this._options?.bridge || !this._options.bridge.disableAlias)
    ) {
      new ReactBridgePlugin({
        moduleFederationOptions: this._options,
      }).apply(compiler);
    }
  }

  get statsResourceInfo(): Partial<ResourceInfo> | undefined {
    return this._mfPlugin?.statsResourceInfo;
  }
}
