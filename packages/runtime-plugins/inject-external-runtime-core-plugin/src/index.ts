import * as runtimeCore from '@module-federation/runtime-tools/runtime-core';

import type {
  ModuleFederationRuntimePlugin,
  RuntimeImageDescriptorV1,
} from '@module-federation/runtime-tools/runtime-core';
declare global {
  var __VERSION__: string;
  var _FEDERATION_RUNTIME_CORE: typeof runtimeCore;
  var _FEDERATION_RUNTIME_CORE_FROM: {
    version: string;
    name: string;
    entryLoadingIdentity?: string;
    runtimeImage?: RuntimeImageDescriptorV1;
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
      const runtimeImage =
        args.userOptions?.runtimeImage ?? args.options.runtimeImage;
      if (globalRef._FEDERATION_RUNTIME_CORE) {
        const provider = globalRef._FEDERATION_RUNTIME_CORE_FROM;
        if (provider) {
          runtimeCore.assertRuntimeImageCompatible(
            provider.runtimeImage,
            runtimeImage,
          );
        }
        if (
          provider &&
          !provider.runtimeImage &&
          (provider.name !== name || provider.version !== version)
        ) {
          console.warn(
            `Detect multiple module federation runtime! Injected runtime from ${provider.name}@${provider.version} and current is ${name}@${version}, pleasure ensure there is only one consumer to provider runtime!`,
          );
        }
        return args;
      }
      if (!runtimeImage) {
        console.warn(
          'External runtime-core metadata is missing. Reuse stays in legacy compatibility mode.',
        );
      }
      globalRef._FEDERATION_RUNTIME_CORE = runtimeCore;
      globalRef._FEDERATION_RUNTIME_CORE_FROM = {
        version,
        name,
        entryLoadingIdentity: `@module-federation/runtime-core@${version}:1`,
        ...(runtimeImage ? { runtimeImage } : {}),
      };
      return args;
    },
  };
}

export default injectExternalRuntimeCorePlugin;
