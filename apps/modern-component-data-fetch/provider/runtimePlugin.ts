import { FederationRuntimePlugin } from '@module-federation/modern-js';

export default function (): FederationRuntimePlugin {
  return {
    name: 'next-internal-plugin',
    beforeInit: function (args) {
      if (typeof window === 'undefined') {
        throw new Error('Force downgrade');
      }
      return args;
    },
  };
}
