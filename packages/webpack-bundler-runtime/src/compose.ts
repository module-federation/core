import { init as composeInit } from '@module-federation/runtime/compose';
import type {
  Capabilities,
  FederationKernel,
  UserOptions,
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
  'instance' | 'bundlerRuntime' | 'runtime'
> & {
  instance?: FederationKernel;
  bundlerRuntime: Partial<BundlerRuntime> & {
    S: BundlerRuntime['S'];
    init(options: { webpackRequire: WebpackRequire }): FederationKernel;
  };
  runtime: {
    init(options: UserOptions): FederationKernel;
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
  const init = (options: UserOptions) =>
    composeInit({ ...options, id: options.id || buildId }, capabilities);
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
        return init(initOptions);
      },
    },
    attachShareScopeMap,
    bundlerRuntimeOptions: {},
    // rspack native runtimes before 2.0.0-beta.1 call federation.runtime.init.
    runtime: { init },
  };
  for (const adapter of adapters) {
    Object.assign(federation.bundlerRuntime, adapter.bundlerRuntime);
  }
  return federation;
}
