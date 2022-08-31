/**
 * If HMR through websocket received {"invalid":true, "event":"pong"} event
 *   then pages reloads. But for federated page this is unwanted behavior.
 *
 * So this plugin in DEV mode disables page.reload() in HMR for federated pages.
 */
class DevHmrFixInvalidPongPlugin {
  /**
   * Apply the plugin
   * @param {import("webpack").Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler) {
    const webpack = compiler.webpack;

    compiler.hooks.thisCompilation.tap(
      'DevHmrFixInvalidPongPlugin',
      (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: 'DevHmrFixInvalidPongPlugin',
            state: compilation.constructor.PROCESS_ASSETS_STAGE_PRE_PROCESS,
          },
          (assets) => {
            Object.keys(assets).forEach((filename) => {
              if (filename.endsWith('/main.js')) {
                const asset = compilation.getAsset(filename);
                const newSource = asset.source.source().replace(
                  new RegExp(
                    escapeRegExp(
                      'if (payload.event === \\"pong\\" && payload.invalid && !self.__NEXT_DATA__.err) {'
                    ),
                    'g'
                  ),
                  `if (payload.event === \\"pong\\" && payload.invalid && !self.__NEXT_DATA__.err) {
                    if (window.mf_router &&  window.mf_router.isFederatedPathname(window.location.pathname)) return;
                  `.replaceAll('\n', '\\n')
                );

                const updatedAsset = new webpack.sources.RawSource(newSource);

                if (asset) {
                  compilation.updateAsset(filename, updatedAsset);
                } else {
                  compilation.emitAsset(filename, updatedAsset);
                }
              }
            });
          }
        );
      }
    );
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

module.exports = DevHmrFixInvalidPongPlugin;
