import * as runtimeCore from '@module-federation/runtime-tools/runtime-core';

import type { FederationRuntimePlugin } from '@module-federation/runtime-tools/runtime-core';
declare global {
  var __VERSION__: string;
  var _FEDERATION_RUNTIME_CORE: typeof runtimeCore;
  var _FEDERATION_RUNTIME_CORE_FROM: {
    version: string;
    name: string;
  };
}

function injectExternalRuntimeCorePlugin(): FederationRuntimePlugin {
  return {
    name: 'inject-external-runtime-core-plugin',
    version: __VERSION__,
    beforeInit(args) {
      const name = args.options.name;
      const version = __VERSION__;
      if (
        runtimeCore.Global._FEDERATION_RUNTIME_CORE &&
        runtimeCore.Global._FEDERATION_RUNTIME_CORE_FROM &&
        (runtimeCore.Global._FEDERATION_RUNTIME_CORE_FROM.name !== name ||
          runtimeCore.Global._FEDERATION_RUNTIME_CORE_FROM.version !== version)
      ) {
        console.warn(
          `Detect multiple module federation runtime! Injected runtime from ${runtimeCore.Global._FEDERATION_RUNTIME_CORE_FROM.name}@${runtimeCore.Global._FEDERATION_RUNTIME_CORE_FROM.version} and current is ${name}@${version}, pleasure ensure there is only one consumer to provider runtime!`,
        );
        return args;
      }
      runtimeCore.Global._FEDERATION_RUNTIME_CORE = runtimeCore;
      runtimeCore.Global._FEDERATION_RUNTIME_CORE_FROM = {
        version,
        name,
      };
      return args;
    },
  };
}

export default injectExternalRuntimeCorePlugin;
