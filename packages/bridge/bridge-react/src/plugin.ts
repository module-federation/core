import type { FederationRuntimePlugin } from '@module-federation/runtime';
import { createRemoteComponent } from './create';
import { createBridgeComponent } from './provider';

function BridgeReactPlugin(): FederationRuntimePlugin {
  return {
    name: 'bridge-react-plugin',
    beforeInit(args) {
      const originalCreateRemoteComponent = createRemoteComponent;
      // @ts-ignore
      args.origin.createRemoteComponent = function (info) {
        return originalCreateRemoteComponent({
          ...info,
          instance: args.origin,
        });
      };

      const originalCreateBridgeComponentt = createBridgeComponent; // 保存原始函数
      // @ts-ignore
      args.origin.createBridgeComponent = function (info) {
        return originalCreateBridgeComponentt({
          ...info,
          instance: args.origin,
        });
      };
      return args;
    },
  };
}

export default BridgeReactPlugin;
