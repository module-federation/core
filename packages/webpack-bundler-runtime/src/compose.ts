import { init as composeInit } from '@module-federation/runtime/compose';
import type {
  Capabilities,
  FederationKernel,
  NodePlatform,
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
  'runtime' | 'instance' | 'bundlerRuntime'
> & {
  instance?: FederationKernel;
  bundlerRuntime: Partial<BundlerRuntime> & {
    S: BundlerRuntime['S'];
    init(options: { webpackRequire: WebpackRequire }): FederationKernel;
  };
  runtime: { loadScriptNode: NodePlatform['loadScriptNode'] };
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
    runtime: {
      loadScriptNode(url, info) {
        const platform = federation.instance?.platform as
          | Partial<NodePlatform>
          | undefined;
        if (!platform?.loadScriptNode) {
          throw new Error(
            'federation.runtime.loadScriptNode needs a node or universal platform capability.',
          );
        }
        return platform.loadScriptNode(url, info);
      },
    },
  };
  for (const adapter of adapters) {
    Object.assign(federation.bundlerRuntime, adapter.bundlerRuntime);
  }
  return federation;
}
