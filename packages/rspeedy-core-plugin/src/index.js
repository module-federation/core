const pluginName = '@module-federation/rspeedy-core-plugin';

/**
 * Runtime plugin that loads remote entries via Lynx native loaders instead of DOM script tags.
 * It avoids the JSONP/script-path entirely and delegates to `lynx.requireModuleAsync`, which
 * is the same primitive used by rspeedy's chunk loader for background and main-thread bundles.
 */
export default function RspeedyCorePlugin() {
  return {
    name: pluginName,
    /*
     * Intercept remote entry loading and use lynx.requireModuleAsync.
     * If lynx is not available we fall back to the default runtime behaviour.
     */
    async loadEntry({ remoteInfo }) {
      const lynx = globalThis?.lynx;
      if (!lynx || typeof lynx.requireModuleAsync !== 'function') {
        return;
      }

      const entryUrl = remoteInfo.entry;
      const entryGlobalName =
        remoteInfo.entryGlobalName || remoteInfo.name || 'remote';

      const exportsFromRequire = await new Promise((resolve, reject) => {
        try {
          lynx.requireModuleAsync(entryUrl, (err, mod) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(mod);
          });
        } catch (err) {
          reject(err);
        }
      });

      // Prefer the module returned by requireModuleAsync, but also
      // check the global init hook that MF containers normally register.
      return (
        exportsFromRequire ||
        globalThis[entryGlobalName] ||
        globalThis[remoteInfo.name]
      );
    },
  };
}
