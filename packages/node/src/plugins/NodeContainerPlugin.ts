'use strict';

import type { Compiler, container } from 'webpack';

type ContainerPluginOptions = ConstructorParameters<typeof container.ContainerPlugin>[0];

/**
 * Interface for NodeContainerOptions which extends ContainerPluginOptions
 * @interface
 * @property {Record<string, unknown>} experiments - Optional experiments configuration
 * @property {boolean} debug - Optional debug flag
 */
export interface NodeContainerOptions extends ContainerPluginOptions {
    experiments?: Record<string, unknown>;
    debug?: boolean;
}

/**
 * Interface for Context
 * @interface
 * @property {typeof container.ContainerPlugin} ContainerPlugin - Optional ContainerPlugin
 */
interface Context {
  ContainerPlugin?: typeof container.ContainerPlugin;
}

// possible remote evaluators
// this depends on the chunk format selected.
// commonjs2 - it think, is lazily evaluated - beware
// const remote = eval(scriptContent + '\n  try{' + moduleName + '}catch(e) { null; };');
// commonjs - fine to use but exports marker doesnt exist
// const remote = eval('let exports = {};' + scriptContent + 'exports');
// commonjs-module, ideal since it returns a commonjs module format
// const remote = eval(scriptContent + 'module.exports')

/**
 * Class representing a NodeContainerPlugin.
 * @class
 */
class NodeContainerPlugin {
  private _options: NodeContainerOptions;
  private context: Context;
  private experiments: NodeContainerOptions['experiments'];

  /**
   * Create a NodeContainerPlugin.
   * @constructor
   * @param {NodeContainerOptions} opts - The options for the NodeContainerPlugin
   * @param {Context} context - The context for the NodeContainerPlugin
   */
  constructor(opts: NodeContainerOptions, context: Context) {
    // @todo debug flag is not used
    const { experiments = {}, debug, ...options } = opts;
    this._options = options || ({} as NodeContainerOptions);
    this.context = context || ({} as Context);
    this.experiments = experiments || {};
  }

  /**
   * Apply method for the NodeContainerPlugin class.
   * @method
   * @param {Compiler} compiler - The webpack compiler.
   */
  apply(compiler: Compiler) {
    // When used with Next.js, context is needed to use Next.js webpack
    const { webpack } = compiler;

    const pluginOptions = {
      name: this._options.name,
      filename: this._options.filename,
      exposes: this._options.exposes,
      library: this._options.library,
      runtime: this._options.runtime,
      shareScope: this._options.shareScope,
    };
    //    //TODO can use import meta mock object but need to update data structure of remote_scope
    //     if (compiler.options && compiler.options.output) {
    //       compiler.options.output.importMetaName = 'remoteContainerRegistry';
    //     }

    // const chunkFileName = compiler.options?.output?.chunkFilename;
    // const uniqueName =
    //   compiler?.options?.output?.uniqueName || this._options.name;

    // if (typeof chunkFileName === 'string' && uniqueName && !chunkFileName.includes(uniqueName)) {
    //   const suffix = `-[chunkhash].js`;
    //   compiler.options.output.chunkFilename = chunkFileName.replace('.js', suffix);
    // }
    const ContainerPlugin = this.getContainerPlugin(compiler);
    new ContainerPlugin(pluginOptions).apply(
      compiler,
    );
  }

  private getContainerPlugin(compiler: Compiler): typeof container.ContainerPlugin {
    if (this.context.ContainerPlugin) {
      return this.context.ContainerPlugin;
    }
    if (compiler.webpack && compiler.webpack.container && compiler.webpack.container.ContainerPlugin) {
      return compiler.webpack.container.ContainerPlugin;
    }
    return require('webpack/lib/container/ContainerPlugin');
  }
}

export default NodeContainerPlugin;
