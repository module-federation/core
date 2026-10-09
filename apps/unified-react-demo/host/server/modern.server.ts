import { defineServerConfig } from '@modern-js/server-runtime';
import snapshot from '../static-snapshot.json';
export default defineServerConfig({
  middlewares: [
    {
      name: 'inject-static-federation-snapshot',
      handler: async (_context, next) => {
        if (process.env.DEMO_MODE === 'snapshot') {
          const scope = globalThis as any;
          scope.__FEDERATION__ ||= {};
          scope.__FEDERATION__.moduleInfo ||= {};
          Object.assign(scope.__FEDERATION__.moduleInfo, snapshot);
        }
        await next();
      },
    },
  ],
});
