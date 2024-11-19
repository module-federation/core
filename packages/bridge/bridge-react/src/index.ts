import type { FederationRuntimePlugin } from '@module-federation/runtime';
import { createRemoteComponentWithInstance } from './create';
import { createBridgeComponentWithInstance } from './provider';
import type { CreateRemoteComponent } from './create';
import type { CreateBridgeComponent } from './provider';

let createRemoteComponent: CreateRemoteComponent;
let createBridgeComponent: CreateBridgeComponent;
function BridgeReactPlugin(): FederationRuntimePlugin {
  return {
    name: 'bridge-react-plugin',
    beforeInit(args) {
      // @ts-ignore
      createRemoteComponent = createRemoteComponentWithInstance(args.origin);
      createBridgeComponent = createBridgeComponentWithInstance(args.origin);
      return args;
    },
  };
}

export { BridgeReactPlugin, createRemoteComponent, createBridgeComponent };
export type {
  ProviderParams,
  RenderFnParams,
} from '@module-federation/bridge-shared';
