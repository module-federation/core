import { FederationRuntimePlugin } from '@module-federation/runtime/types';

export default function (): FederationRuntimePlugin {
  return {
    name: 'custom-plugin-build',
    beforeInit(args) {
      console.log('[build time inject] beforeInit: ', args);
      return args;
    },
    beforeLoadShare(args) {
      console.log('[build time inject] beforeLoadShare: ', args);

      return args;
    },
  };
}
