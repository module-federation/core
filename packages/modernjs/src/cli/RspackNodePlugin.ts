import type { Rspack } from '@modern-js/app-tools';

export default class RspackNodePlugin implements Rspack.RspackPluginInstance {
  constructor() {}
  apply(compiler: Rspack.Compiler) {
    const { webpack } = compiler;

    compiler.options.output.chunkFormat = 'commonjs';
    if (compiler.options.output.enabledLibraryTypes === undefined) {
      compiler.options.output.enabledLibraryTypes = ['commonjs-module'];
    } else {
      compiler.options.output.enabledLibraryTypes.push('commonjs-module');
    }

    compiler.options.output.chunkLoading = 'async-node';
    compiler.options.output.enabledChunkLoadingTypes = [];
    compiler.options.output.environment = {
      ...compiler.options.output.environment,
      dynamicImport: true,
    };
    new webpack.node.NodeEnvironmentPlugin.apply(compiler);
    new webpack.node.NodeTargetPlugin().apply(compiler);
  }
}
