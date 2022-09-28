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
    const { isServer, ...options } = this.options;
    const { webpack } = compiler;

    if (isServer || compiler.options.name === 'server') {
      new NodeFederationPlugin(options, this.context).apply(compiler);
      new StreamingTargetPlugin(options).apply(compiler);
    } else {
      new (this.context.ModuleFederationPlugin ||
        (webpack && webpack.container.ModuleFederationPlugin) ||
        require('webpack/lib/container/ModuleFederationPlugin'))(options).apply(
        compiler
      );
    }
  }
}

export default UniversalFederationPlugin;
