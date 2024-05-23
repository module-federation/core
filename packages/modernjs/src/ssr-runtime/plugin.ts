import type { Plugin } from '@modern-js/runtime';

export const mfPluginSSR = ({ name }: { name?: string }): Plugin => ({
  name: '@module-federation/modern-js',

  setup: () => {
    let mfDevServer;
    return {
      async init({ context }, next) {
        if (typeof window !== 'undefined') {
          return next({ context });
        }
        const devServer = await import('@module-federation/dts-plugin/server');
        if (name) {
          mfDevServer = new devServer.ModuleFederationDevServer({
            name: `${name}-server`,
            remotes: [],
            updateCallback: async () => {},
            remoteTypeTarPath: '',
          });
        }
        const nodeUtils = await import('@module-federation/node/utils');
        const shouldUpdate = await nodeUtils.revalidate();
        if (shouldUpdate) {
          console.log('should RELOAD', shouldUpdate);
          await nodeUtils.flushChunks();
          mfDevServer &&
            mfDevServer.update({
              updateKind: devServer.UpdateKind.RELOAD_PAGE,
              updateMode: devServer.UpdateMode.POSITIVE,
              clientName: name,
            });
        }
        return next({ context });
      },
    };
  },
});
