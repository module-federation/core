import { init as composeInit } from '@module-federation/runtime/compose';
import type {
  Capabilities,
  FederationKernel,
} from '@module-federation/runtime-core/kernel';
import { attachShareScopeMap } from './attachShareScopeMap';
import type {
  Adapter,
  BundlerRuntime,
  Federation,
  WebpackRequire,
} from './types';

export type ComposedFederation = Omit<
  Federation,
  'instance' | 'bundlerRuntime'
> & {
  instance?: FederationKernel;
  bundlerRuntime: Partial<BundlerRuntime> & {
    S: BundlerRuntime['S'];
    init(options: { webpackRequire: WebpackRequire }): FederationKernel;
  };
};

export function createFederation({
  buildId,
  capabilities,
  adapters,
}: {
  buildId: string;
  capabilities: Capabilities;
  adapters: Adapter[];
}): ComposedFederation {
  const federation: ComposedFederation = {
    instance: undefined,
    initOptions: undefined,
    bundlerRuntime: {
      S: {},
      init({ webpackRequire }) {
        const { initOptions } = webpackRequire.federation;
        if (!initOptions) {
          throw new Error('initOptions is required!');
        }
        for (const adapter of adapters) {
          adapter.beforeInit?.(webpackRequire, initOptions);
        }
        return composeInit(
          { ...initOptions, id: initOptions.id || buildId },
          capabilities,
        );
      },
    },
    attachShareScopeMap,
    bundlerRuntimeOptions: {},
  };
  for (const adapter of adapters) {
    Object.assign(federation.bundlerRuntime, adapter.bundlerRuntime);
  }
  return federation;
}
