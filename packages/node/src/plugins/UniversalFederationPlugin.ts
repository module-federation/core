import StreamingTargetPlugin from './StreamingTargetPlugin';
import NodeFederationPlugin from './NodeFederationPlugin';
import { ModuleFederationPluginOptions } from '../types';
import type { Compiler, container } from 'webpack';

interface NodeFederationOptions extends ModuleFederationPluginOptions {
  isServer: boolean;
  promiseBaseURI?: string;
}

interface NodeFederationContext {
  ModuleFederationPlugin?: typeof container.ModuleFederationPlugin;
}

class UniversalFederationPlugin {
  private options: NodeFederationOptions;
  private context: NodeFederationContext;

  constructor(options: NodeFederationOptions, context: NodeFederationContext) {
    this.options = options || {};
    this.context = context || {};
  }

  apply(compiler: Compiler) {
    const isServer =
      this.options.isServer || compiler.options.name === 'server';
    const { webpack } = compiler;

    if (isServer) {
      new NodeFederationPlugin(this.options, this.context).apply(compiler);
      new StreamingTargetPlugin(this.options).apply(compiler);
    } else {
      new (this.context.ModuleFederationPlugin ||
        (webpack && webpack.container.ModuleFederationPlugin) ||
        require('webpack/lib/container/ModuleFederationPlugin'))(
        this.options
      ).apply(compiler);
    }
  }
}

export default UniversalFederationPlugin;
