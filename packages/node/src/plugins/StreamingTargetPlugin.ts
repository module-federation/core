import type { Compiler } from 'webpack';
import type { ModuleFederationPluginOptions } from '../types';

import CommonJsChunkLoadingPlugin from './CommonJsChunkLoadingPlugin';

interface StreamingTargetOptions extends ModuleFederationPluginOptions {
  promiseBaseURI?: string;
  debug?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface StreamingTargetContext {}

class StreamingTargetPlugin {
  private options: StreamingTargetOptions;

  constructor(options: StreamingTargetOptions) {
    this.options = options || {};
  }

  apply(compiler: Compiler) {
    // When used with Next.js, context is needed to use Next.js webpack
    const { webpack } = compiler;

    compiler.options.output.chunkFormat = 'commonjs';
    if (compiler.options.output.enabledLibraryTypes === undefined) {
      compiler.options.output.enabledLibraryTypes = ['commonjs-module'];
    } else {
      compiler.options.output.enabledLibraryTypes.push('commonjs-module');
    }

    compiler.options.output.chunkLoading = 'async-node';

    // Disable default config
    // FIXME: enabledChunkLoadingTypes is of type 'string[] | undefined'
    // Can't use the 'false' value as it isn't the right format,
    // Emptying it out ensures theres no other readFileVm added to webpack runtime
    compiler.options.output.enabledChunkLoadingTypes = [];
    compiler.options.output.environment = {
      ...compiler.options.output.environment,
      dynamicImport: true,
    };

    new (webpack?.node?.NodeEnvironmentPlugin ||
      require('webpack/lib/node/NodeEnvironmentPlugin'))({
      infrastructureLogging: compiler.options.infrastructureLogging,
    }).apply(compiler);

    new (webpack?.node?.NodeTargetPlugin ||
      require('webpack/lib/node/NodeTargetPlugin'))().apply(compiler);
    new CommonJsChunkLoadingPlugin({
      asyncChunkLoading: true,
      name: this.options.name,
      remotes: this.options.remotes as Record<string, string>,
      baseURI: compiler.options.output.publicPath,
      promiseBaseURI: this.options.promiseBaseURI,
      debug: this.options.debug,
    }).apply(compiler);
  }
}

export default StreamingTargetPlugin;
