import type { Compiler, WebpackPluginInstance } from 'webpack';
import { type moduleFederationPlugin } from '@module-federation/sdk';
import { DevPlugin } from './DevPlugin';
import { TypesPlugin } from './TypesPlugin';

export class DtsPlugin implements WebpackPluginInstance {
  options: moduleFederationPlugin.ModuleFederationPluginOptions;
  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    const { options } = this;
    new DevPlugin(options).apply(compiler);
    new TypesPlugin(options).apply(compiler);
  }
}
