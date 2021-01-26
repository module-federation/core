const ConcatSource = require('webpack-sources/lib/ConcatSource');

module.exports = class ModuleFedSingleRuntimePlugin {
  constructor(options) {
    this._options = {fileName: 'remoteEntry.js', ...options};
  }
  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    if (!this._options) return null;
    const options = this._options;

    // Specify the event hook to attach to
    compiler.hooks.emit.tap("EnableSingleRunTimeForFederationPlugin", (compilation) => {
      const { assets } = compilation;
      const runtime  = assets['runtime.js'];
      const remoteEntry = assets[this._options.fileName];
      const mergedSource = new ConcatSource(runtime, remoteEntry);
      assets[this._options.fileName] = mergedSource;
    });
  }
};
