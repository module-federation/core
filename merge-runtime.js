
const ConcatSource = require('webpack-sources/lib/ConcatSource');

const PLUGIN_NAME = "ModuleFedSingleRuntimePlugin";

/**
 * Merge a runtime with your remote entry.
 */
class ModuleFedSingleRuntimePlugin {
  /**
   * @param {object} options
   * @param {string} [options.fileName= remoteEntry.js] The file name to concat the runtime with
   * @param {string} [options.runtime= runtime.js] The runtime to merge
   */
  constructor(options) {
    this._options = {fileName: 'remoteEntry.js', runtime: 'runtime.js', ...options};
  }
  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    if (!this._options) return null;
    const options = this._options;

    // Specify the event hook to attach to
    compiler.hooks.emit.tap(PLUGIN_NAME, (compilation) => {
      const { assets } = compilation;
      const runtime  = assets[this._options.runtime];
      const remoteEntry = assets[this._options.fileName];
      const mergedSource = new ConcatSource(runtime, remoteEntry);
      assets[this._options.fileName] = mergedSource;
    });
  }
};

module.exports = ModuleFedSingleRuntimePlugin;
