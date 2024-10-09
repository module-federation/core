import type { FederationRuntimePlugin } from '@module-federation/runtime';
import { SHARED_STRATEGY } from '../constant';

const sharedStrategy: () => FederationRuntimePlugin = () => ({
  name: 'shared-strategy',
  beforeInit(args) {
    const { userOptions } = args;
    if (args.options.shareStrategy! == SHARED_STRATEGY) {
      args.options.shareStrategy = 'loaded-first';
      console.warn(
        `[Module Federation Data Prefetch]: Your shared strategy is set to 'loaded-first', this is a necessary condition for data prefetch`,
      );
    }
    return args;
  },
});

export default sharedStrategy;
