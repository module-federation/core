import { pruned } from 'pruned-pkg';
import { used } from 'used-pkg';

export default function () {
  return {
    name: 'hoist-inactive-connections',
    beforeInit(args) {
      globalThis.hoistInactiveConnectionsUsed = used;
      return args;
    },
  };
}
