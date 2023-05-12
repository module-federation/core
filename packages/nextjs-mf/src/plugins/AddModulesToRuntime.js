import DelegateModulesPlugin from '@module-federation/utilities/src/plugins/DelegateModulesPlugin';
import { Chunk } from 'webpack';

/**
 * A webpack plugin that moves specified modules from chunks to runtime chunk.
 * @class AddModulesToRuntimeChunkPlugin
 */
class AddModulesToRuntimeChunkPlugin {
  constructor(options) {
    this.options = { debug: false, ...options };
  }

  /**
   * Applies the plugin to the webpack compiler.
   * @param {Object} compiler - The webpack compiler instance.
   */
  apply(compiler) {
    // Check if the target is the server
    const isServer = compiler.options.name === 'server';
    const { runtime, container, remotes, shared, eager, applicationName } =
      this.options;

    new DelegateModulesPlugin({
      runtime,
      container,
      remotes,
    }).apply(compiler);

    //TODO: investigate further and see if this can be used to add async boundries

    // if (
    //   compiler.options.mode === 'development' &&
    //   typeof compiler.options.entry === 'function' &&
    //   !isServer
    // ) {
    // const backupEntries = compiler.options.entry;
    // compiler.options.entry = () =>
    //   backupEntries().then((entries) => {
    //     //loop over object with for
    //     if (entries) {
    //       for (const [key, value] of Object.entries(entries)) {
    //         if (key === 'main') {
    //           value.import[0] =
    //             require.resolve('./async-pages-loader') +
    //             '!' +
    //             value.import[0];
    //         }
    //         if (key === 'pages/_app') {
    //           value.import[1] =
    //             require.resolve('./async-pages-loader') +
    //             '!' +
    //             value.import[1];
    //         }
    //         if (value.import[0].startsWith('next-client-pages-loader')) {
    //           value.import[0] =
    //             require.resolve('./async-pages-loader') +
    //             '!' +
    //             value.import[0];
    //         }
    //       }
    //     }
    //     return entries;
    //   });
    // }
  }
}

export default AddModulesToRuntimeChunkPlugin;
