import type {
  FederationRuntimePlugin,
  FederationHost,
} from '@module-federation/runtime';

export type FederationRuntimeType = {
  instance: FederationHost | null;
};

export const federationRuntime: FederationRuntimeType = { instance: null };

function BridgeReactPlugin(): FederationRuntimePlugin {
  return {
    name: 'bridge-react-plugin',
    beforeInit(args) {
      federationRuntime.instance = args.origin;
      return args;
    },
  };
}

export default BridgeReactPlugin;
