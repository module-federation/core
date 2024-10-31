import { FederationRuntimePlugin } from '@module-federation/runtime/types';
export default function (): FederationRuntimePlugin {
  return {
    name: 'custom-plugin',
    beforeInit(args) {
      const { userOptions, shareInfo } = args;
      const { shared } = userOptions;

      if (shared) {
        Object.keys(shared || {}).forEach((sharedKey) => {
          const sharedItem = shared[sharedKey];
          if (!Array.isArray(sharedItem) && !sharedItem.strategy) {
            sharedItem.strategy = 'loaded-first';
          }
        });
      }
      return args;
    },
    beforeRequest(args) {
      console.log('beforeRequest: ', args);
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
      // randomly switch between different modules
      // if (Math.random() > 0.5) {
      //   args.expose = './Button1';
      //   return args;
      // }

      return args;
    },
    onLoad(args) {
      console.log('onLoad: ', args);
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
