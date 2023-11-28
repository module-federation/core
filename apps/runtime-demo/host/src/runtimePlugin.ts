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
      //@ts-ignore
      // anything can be script loader
      console.log('createScript', args);
      await fetch(args.url).then((res) => {
        res.text().then((text) => {
          eval(text);
        });
      });
    },
    //@ts-ignore
    loadRemoteMatch(things: any) {
      console.log('loadRemoteMatch', things);
      // randomly switch between different modules
      if (Math.random() > 0.5) {
        things.expose = './Button1';
        return things;
      }

      return things;
    },
    loadRemote(args) {
      console.log('loadRemote: ', args);
      return args;
    },
    //@ts-ignore
    async loadShare(args) {
      console.log('loadShare:', args);
      return args;
    },
    //@ts-ignore
    async beforeLoadShare(args) {
      console.log('beforeloadShare:', args);
      return args;
    },
    //@ts-ignore
    async generatePreloadAssets(args) {
      console.log('generatePreloadAssets: ', args);
      return Promise.resolve(args);
    },
  };
}
