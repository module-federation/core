const ConcatSource = require("webpack-sources/lib/ConcatSource");
const Compilation = require("webpack/lib/Compilation");

module.exports = class ModuleFedSingleRuntimePlugin {
  constructor(options) {
    this._options = { fileName: "static/runtime/remoteEntry.js", ...options };
  }
  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    if (!this._options) return null;
    const { fileName } = this._options;

    // Specify the event hook to attach to
    compiler.hooks.thisCompilation.tap(
      "EnableSingleRunTimeForFederationPlugin",
      (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: "EnableSingleRunTimeForFederationPlugin",
            stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
          },
          (assets) => {
            Object.keys(assets).forEach((asset) => {
              if (asset.includes("static/chunks/webpack")) {
                compilation.updateAsset(
                  fileName,
                  new ConcatSource(
                    compilation.getAsset(asset).source.buffer().toString(),
                    compilation.getAsset(fileName).source.buffer().toString()
                  )
                );
              }
            });
          }
        );
      }
    );
  }
};
