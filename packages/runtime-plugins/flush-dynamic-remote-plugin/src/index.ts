import type { FederationRuntimePlugin } from '@module-federation/runtime/types';
import { flushDynamicRemote } from './plugin';

type FlushDynamicRemotePluginOptions = {
  expiredTime?: number;
};

function flushDynamicRemotePlugin(
  pluginOptions: FlushDynamicRemotePluginOptions = {},
): FederationRuntimePlugin {
  return {
    name: 'flush-dynamic-remote-plugin',
    beforeRegisterRemote(args) {
      try {
        const shouldFlush = flushDynamicRemote({
          remote: args.remote,
          options: args.options,
          expiredTime: pluginOptions.expiredTime,
        });
        if (shouldFlush && !args.options?.force) {
          args.options = {
            force: true,
          };
        }
        return args;
      } catch (err) {
        console.error(new Error(err as unknown as any));
        return args;
      }
    },
  };
}

export default flushDynamicRemotePlugin;
