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
    beforeRegisterRemote({ remote, options }) {
      try {
        const shouldFlush = flushDynamicRemote({
          remote,
          options,
          expiredTime: pluginOptions.expiredTime,
        });
        return { remote, options: { ...options, force: shouldFlush } };
      } catch (err) {
        console.error(new Error(err as unknown as any));
        return {
          remote,
          options,
        };
      }
    },
  };
}

export default flushDynamicRemotePlugin;
