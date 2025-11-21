• I dug into the dev artifacts to see what changes when we flip the Rspeedy MF plugin on.

1. Run pnpm --filter lynx-host exec rspeedy build --mode development once with the plugin enabled and once with it commented out. That writes the dev
   bundles to apps/lynx-host/dist/.rspeedy/main.
2. Compare background.js between the two runs:

   - Plugin enabled (apps/lynx-host/dist/.rspeedy/main/background.js, ~lines 25 530–25 610): the MF runtime injects the standard webpack JSONP loader:

     **webpack_require**.hmrM = () => {
     if (typeof fetch === "undefined")
     throw new Error("No browser support: need fetch API");
     return fetch(**webpack_require**.p + **webpack_require**.hmrF()).then(...)
     };
     var chunkLoadingGlobal = self["chunk_lynx_host"] = self["chunk_lynx_host"] || [];
     chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
     chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
     self["webpackHotUpdatelynx_host"] = (chunkId, moreModules, runtime) => { ... };
     That’s exactly what shows up in the Lynx runtime logs: self["webpackHotUpdatelynx_host"] ... and the fetch-based manifest loader. Lynx’s JS VM
     doesn’t expose self or the browser fetch API inside the background thread, so processData, renderPage, and the hot-update globals all explode as
     soon as the dev bundle executes.
     soon as the dev bundle executes.

   - Plugin disabled (apps/lynx-host/dist/.rspeedy/main/background.js, ~lines 20 820–20 980): the original chunk loader is still intact and uses
     Lynx’s native APIs:

     **webpack_require**.hmrM = function () {
     return new Promise((resolve, reject) =>
     lynx.requireModuleAsync(**webpack_require**.p + **webpack_require**.hmrF(), (err, ret) => {
     if (err) return reject(err);
     resolve(ret);
     })
     )['catch']((err) => { if (err.code !== 'MODULE_NOT_FOUND') throw err; });
     };
     **webpack_require**.hmrI.require = function(...) { ... }
     **webpack_require**.hmrC.require = function(chunkIds, ...) { ... }

     No JSONP callback, no self["chunk_lynx_host"], and HMR updates flow through lynx.requireModuleAsync, which is why dev mode works when the plugin
     is off.

So the regression isn’t the shared modules themselves—it’s that the stock ModuleFederationPlugin swaps in the browser chunk/HMR runtime (JSONP + self +
fetch) even though Rspeedy’s target has chunkLoading: 'lynx'. We need the Rspeedy-specific plugin to preserve the Lynx chunk loader and manifest loader
instead of letting the MF runtime fall back to JSONP.

Next steps to unblock dev:

1. Adjust the new @module-federation/rspeedy-plugin so that, after it calls pluginModuleFederation, it forces the Rspack config back to the Lynx chunk
   loader. The simplest fix is to hook api.modifyRsbuildConfig and, for each environment, set:

   bundlerConfig.output.chunkLoading = 'lynx';
   bundlerConfig.output.hotUpdateGlobal = undefined;
   bundlerConfig.plugins = bundlerConfig.plugins?.filter(p => p.name !== 'JsonpTemplatePlugin');
   and re-inject the Lynx HMR runtime if necessary (the code that emits lynx.requireModuleAsync lives in the original Rspeedy template).
   and re-inject the Lynx HMR runtime if necessary (the code that emits lynx.requireModuleAsync lives in the original Rspeedy template).

2. Alternatively, tap into api.modifyBundlerChain and override the target to lynx-main/lynx-background before Federation runs so it can’t stomp the
   loader.

Once we keep the custom chunk loader in place, the dev bundle will go back to using lynx.requireModuleAsync and the self/fetch errors disappear.
