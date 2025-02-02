import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';
// you can alse import fallback constant remote entry fallback data
import { manifestJson } from './remote-manifest-data';

const fallbackPlugin: () => FederationRuntimePlugin = function () {
  return {
    name: 'fallback-plugin',
    async errorLoadRemote(args) {
      console.log('============ errorLoadRemote ============', args);
      if (args.lifecycle === 'onLoad') {
        const fallback = 'fallback';
        return fallback;
      } else if (args.lifecycle === 'afterResolve') {
        // you can try another fall back remote entry
        // const response = await fetch('http://localhost:2002/mf-manifest.json');
        // const manifestJson = (await response.json()) as Manifest;
        return manifestJson;
      }
    },
  };
};
export default fallbackPlugin;
