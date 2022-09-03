const CommonJsChunkLoadingPlugin = require("./CommonJsChunkLoadingPlugin")

class StreamingTargetPlugin {
  constructor(options) {
    this.options = options || {};
  }

  apply(compiler) {
    if (compiler.options.target) {
      console.warn(
        `target should be set to false while using StreamingTargetPlugin plugin, actual target: ${compiler.options.target}`
      );
    }
    const webpack = compiler.webpack
    // This will enable CommonJsChunkFormatPlugin
    compiler.options.output.chunkFormat = "commonjs";
    // This will force async chunk loading
    compiler.options.output.chunkLoading = "async-node";
    // Disable default config
    compiler.options.output.enabledChunkLoadingTypes = false;
    const NodeEnvironmentPlugin = (webpack && webpack.node.NodeEnvironmentPlugin) || require("webpack/lib/node/NodeEnvironmentPlugin");
    new NodeEnvironmentPlugin({
      infrastructureLogging: compiler.options.infrastructureLogging,
    }).apply(compiler);
    new (webpack?.node.NodeTargetPlugin ||
      require("webpack/lib/node/NodeTargetPlugin"))().apply(compiler);
    new CommonJsChunkLoadingPlugin(
      {
        asyncChunkLoading: true,
        name: this.options.name,
        remotes: this.options.remotes,
        baseURI: compiler.options.output.publicPath,
        promiseBaseURI: this.options.promiseBaseURI,
      },
      this.context
    ).apply(compiler);
  }
}

module.exports = StreamingTargetPlugin;
