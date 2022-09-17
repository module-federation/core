import type { Compiler } from 'webpack';
import type { ModuleFederationPluginOptions, ExternalsType } from '../../types';

export default class ModuleFederationPlugin {
  private _options!: ModuleFederationPluginOptions;

  constructor(options: ModuleFederationPluginOptions) {
    this._options = options;
  }
  apply(compiler: Compiler) {
    const { _options: options } = this;
    const webpack = compiler.webpack;
    const { ContainerPlugin, ContainerReferencePlugin } = webpack.container;
    const { SharePlugin } = webpack.sharing;
    const library = options.library || { type: 'var', name: options.name };
    const remoteType =
      options.remoteType ||
      (options.library && (options.library.type as ExternalsType)) ||
      'script';

    if (
      library &&
      !compiler.options.output.enabledLibraryTypes?.includes(library.type)
    ) {
      compiler.options.output.enabledLibraryTypes?.push(library.type);
    }

    if (
      options.exposes &&
      (Array.isArray(options.exposes)
        ? options.exposes.length > 0
        : Object.keys(options.exposes).length > 0)
    ) {
      new ContainerPlugin({
        name: options.name as string,
        library,
        filename: options.filename,
        runtime: options.runtime,
        exposes: options.exposes,
      }).apply(compiler);
    }
    if (
      options.remotes &&
      (Array.isArray(options.remotes)
        ? options.remotes.length > 0
        : Object.keys(options.remotes).length > 0)
    ) {
      new ContainerReferencePlugin({
        remoteType,
        remotes: options.remotes,
      }).apply(compiler);
    }
    if (options.shared) {
      new SharePlugin({
        shared: options.shared,
        shareScope: options.shareScope,
      }).apply(compiler);
    }
  }
}
