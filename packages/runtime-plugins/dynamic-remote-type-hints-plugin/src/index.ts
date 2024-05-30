import type { FederationRuntimePlugin } from '@module-federation/runtime/types';

function dynamicRemoteTypeHintsPlugin(
  pluginOptions?: RuntimeVersionPluginOptions,
): FederationRuntimePlugin {
  return {
    name: 'dynamic-remote-type-hints-plugin',
    async onLoad(args) {
      try {
        //do something
      } catch (err) {
        console.error(new Error(err as unknown as any));
      }
      return args;
    },
  };
}

export default dynamicRemoteTypeHintsPlugin;
