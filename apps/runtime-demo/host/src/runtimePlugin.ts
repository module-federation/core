import { FederationRuntimePlugin } from '@module-federation/runtime/type';
export default function (): FederationRuntimePlugin {
  return {
    name: 'custom-plugin',
    beforeInit(args) {
      console.log('beforeInit: ', args);
      return args;
    },
    beforeLoadRemote(args) {
      console.log('beforeLoadRemote: ', args);
      return args;
    },
    //@ts-ignore
    async createScript(args) {
      // anything can be script loader
      console.log('createScript', args);
      return fetch(args.url).then((res) => {
        res.text().then((text) => {
          eval(text);
        });
      });
    },
    // loadRemoteMatch(args) {
    //   console.log('loadRemoteMatch', args);
    //   // randomly switch between different modules
    //   if (Math.random() > 0.5) {
    //     args.expose = './Button1';
    //     return args;
    //   }

    //   return args;
    // },
    loadRemote(args) {
      console.log('loadRemote: ', args);
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
