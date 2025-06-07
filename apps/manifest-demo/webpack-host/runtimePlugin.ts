import { FederationRuntimePlugin } from '@module-federation/runtime/types';

export default function (): FederationRuntimePlugin {
  return {
    name: 'custom-plugin-build',
    beforeInit(args) {
      const { userOptions, origin } = args;
      if (origin.options.name && origin.options.name !== userOptions.name) {
        userOptions.name = origin.options.name;
      }
      console.log('[build time inject] beforeInit: ', args);
      return args;
    },
    beforeLoadShare(args) {
      console.log('[build time inject] beforeLoadShare: ', args);

      return args;
    },
    createLink({ url }) {
      const link = document.createElement('link');
      link.setAttribute('href', url);
      link.setAttribute('rel', 'preload');
      link.setAttribute('as', 'script');
      link.setAttribute('crossorigin', 'anonymous');
      return link;
    },
  };
}
