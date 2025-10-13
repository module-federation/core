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

    // 检测用户是否安装了 bridge-react
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

    // 决定是否启用 ReactBridgePlugin
    const shouldEnableBridgePlugin = () => {
      // 优先级1: 用户显式配置 enableBridgeRouter
      if (this._options?.bridge?.enableBridgeRouter === true) {
        return true;
      }

      // 优先级2: 用户显式禁用 (向后兼容 disableAlias)
      if (
        this._options?.bridge?.enableBridgeRouter === false ||
        this._options?.bridge?.disableAlias === true
      ) {
        return false;
      }

      // 优先级3: 自动检测 - 用户安装了 bridge-react 且未显式禁用
      return hasBridgeReact;
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
