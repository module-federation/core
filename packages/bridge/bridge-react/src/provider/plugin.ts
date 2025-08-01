import type {
  ModuleFederationRuntimePlugin,
  ModuleFederation,
} from '@module-federation/runtime';

export type FederationRuntimeType = {
  instance: ModuleFederation | null;
};

export const federationRuntime: FederationRuntimeType = { instance: null };

function BridgeReactPlugin(): ModuleFederationRuntimePlugin {
  return {
    name: 'bridge-react-plugin',
    beforeInit(args) {
      federationRuntime.instance = args.origin;
      return args;
    },
  };
}

export default BridgeReactPlugin;
