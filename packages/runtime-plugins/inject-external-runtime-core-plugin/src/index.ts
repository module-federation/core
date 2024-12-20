import * as runtimeCore from '@module-federation/runtime-tools/runtime-core';

import type { FederationRuntimePlugin } from '@module-federation/runtime-tools/runtime-core';
declare global {
  var _FEDERATION_RUNTIME_CORE: typeof runtimeCore;
}

function injectExternalRuntimeCorePlugin(): FederationRuntimePlugin {
  return {
    name: 'inject-external-runtime-core-plugin',
    beforeInit(args) {
      runtimeCore.Global._FEDERATION_RUNTIME_CORE = runtimeCore;
      return args;
    },
  };
}

export default injectExternalRuntimeCorePlugin;
