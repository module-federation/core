import { ModuleFederationRuntimePlugin } from '@module-federation/runtime/types';
export default function (): ModuleFederationRuntimePlugin {
  return {
    name: 'custom-plugin',
    beforeInit(args) {
      console.log('beforeInit: ', args);
      // #region agent log
      fetch(
        'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '7e9739',
          },
          body: JSON.stringify({
            sessionId: '7e9739',
            runId: 'manifest-host-runtime',
            hypothesisId: 'H16',
            location: 'apps/manifest-demo/webpack-host/src/runtimePlugin.ts:8',
            message: 'runtime beforeInit',
            data: {
              name: args && args.userOptions && args.userOptions.name,
              remoteCount:
                args &&
                args.userOptions &&
                Array.isArray(args.userOptions.remotes)
                  ? args.userOptions.remotes.length
                  : 0,
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
      return args;
    },
    beforeRequest(args) {
      console.log('beforeRequest: ', args);
      // #region agent log
      fetch(
        'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '7e9739',
          },
          body: JSON.stringify({
            sessionId: '7e9739',
            runId: 'manifest-host-runtime',
            hypothesisId: 'H16',
            location: 'apps/manifest-demo/webpack-host/src/runtimePlugin.ts:14',
            message: 'runtime beforeRequest',
            data: {
              id: args && args.id,
              name: args && args.options && args.options.name,
              entry: args && args.options && args.options.entry,
              expose: args && args.options && args.options.expose,
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
      return args;
    },
    //@ts-ignore
    // async createScript(args) {
    //   // anything can be script loader
    //   console.log('createScript', args);
    //   return fetch(args.url).then((res) => {
    //     res.text().then((text) => {
    //       eval(text);
    //     });
    //   });
    // },
    afterResolve(args) {
      console.log('afterResolve', args);
      // #region agent log
      fetch(
        'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '7e9739',
          },
          body: JSON.stringify({
            sessionId: '7e9739',
            runId: 'manifest-host-runtime',
            hypothesisId: 'H16',
            location: 'apps/manifest-demo/webpack-host/src/runtimePlugin.ts:29',
            message: 'runtime afterResolve',
            data: {
              id: args && args.id,
              remoteName: args && args.remote && args.remote.name,
              entry: args && args.remote && args.remote.entry,
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
      // randomly switch between different modules
      // if (Math.random() > 0.5) {
      //   args.expose = './Button1';
      //   return args;
      // }

      return args;
    },
    onLoad(args) {
      console.log('onLoad: ', args);
      // #region agent log
      fetch(
        'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '7e9739',
          },
          body: JSON.stringify({
            sessionId: '7e9739',
            runId: 'manifest-host-runtime',
            hypothesisId: 'H16',
            location: 'apps/manifest-demo/webpack-host/src/runtimePlugin.ts:41',
            message: 'runtime onLoad',
            data: {
              id: args && args.id,
              pkgNameOrAlias: args && args.pkgNameOrAlias,
              expose: args && args.expose,
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
      return args;
    },
    async loadShare(args) {
      console.log('loadShare:', args);
    },
    async beforeLoadShare(args) {
      console.log('beforeloadShare:', args);
      return args;
    },
  };
}
