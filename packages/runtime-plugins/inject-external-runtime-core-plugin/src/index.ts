import * as runtimeCore from '@module-federation/runtime-tools/dist/runtime-core.js';

import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime-tools/runtime-core';
const runtimeCore =
  (runtimeCoreDefault as typeof runtimeCoreNamespace | undefined) ??
  runtimeCoreNamespace;
declare global {
  var __VERSION__: string;
  var _FEDERATION_RUNTIME_CORE: typeof runtimeCore;
  var _FEDERATION_RUNTIME_CORE_FROM: {
    version: string;
    name: string;
  };
}

function injectExternalRuntimeCorePlugin(): ModuleFederationRuntimePlugin {
  return {
    name: 'inject-external-runtime-core-plugin',
    version: __VERSION__,
    beforeInit(args) {
      const globalRef = (
        runtimeCore as typeof runtimeCore & {
          Global?: typeof runtimeCore.Global;
        }
      ).Global;
      if (!globalRef || typeof globalRef !== 'object') {
        return args;
      }
      const name = args.options.name;
      const version = __VERSION__;

      // Use the real host global rather than runtimeCore.Global, since Global can be
      // missing (tree-shaken/re-export-only) or be a sandboxed view in some MF setups.
      const globalRef = globalThis as typeof globalThis & {
        _FEDERATION_RUNTIME_CORE?: typeof runtimeCore;
        _FEDERATION_RUNTIME_CORE_FROM?: { version: string; name: string };
      };

      if (
        globalRef._FEDERATION_RUNTIME_CORE &&
        globalRef._FEDERATION_RUNTIME_CORE_FROM &&
        (globalRef._FEDERATION_RUNTIME_CORE_FROM.name !== name ||
          globalRef._FEDERATION_RUNTIME_CORE_FROM.version !== version)
      ) {
        console.warn(
          `Detect multiple module federation runtime! Injected runtime from ${globalRef._FEDERATION_RUNTIME_CORE_FROM.name}@${globalRef._FEDERATION_RUNTIME_CORE_FROM.version} and current is ${name}@${version}, pleasure ensure there is only one consumer to provider runtime!`,
        );
        return args;
      }
      globalRef._FEDERATION_RUNTIME_CORE = runtimeCore;
      globalRef._FEDERATION_RUNTIME_CORE_FROM = {
        version,
        name,
      };
      return args;
    },
  };
}

export default injectExternalRuntimeCorePlugin;
