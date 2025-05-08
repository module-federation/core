import type { ServerPluginLegacy } from '@modern-js/server-core';

export default (): ServerPluginLegacy => ({
  name: 'mf-data-fetch-server-plugin',
  setup() {
    return {
      config(config) {
        if (!config.render) {
          config.render = {
            middleware: [],
          };
        } else if (!config.render.middleware) {
          config.render.middleware = [];
        }

        config.render!.middleware!.push(
          async (ctx: { request: any }, next: () => any) => {
            const { request } = ctx;
            console.log('request.url: ', request.url);
            return next();
          },
        );
        return config;
      },
    };
  },
});
