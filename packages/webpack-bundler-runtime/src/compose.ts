import { init, type Capabilities } from '@module-federation/runtime/compose';
import type { WebpackRequire } from './types';
import { attachShareScopeMap } from './attachShareScopeMap';

export type Adapter = {
  bundlerRuntime: Record<string, unknown>;
  beforeInit?: (webpackRequire: WebpackRequire, initOptions: any) => void;
};

export function createFederation({
  capabilities = {},
  adapters = [],
}: {
  capabilities?: Capabilities;
  adapters?: Adapter[];
}) {
  const bundlerRuntime: Record<string, unknown> = {
    S: {},
    init({ webpackRequire }: { webpackRequire: WebpackRequire }) {
      const { initOptions } = webpackRequire.federation;
      if (!initOptions) {
        throw new Error('initOptions is required!');
      }
      for (const adapter of adapters) {
        adapter.beforeInit?.(webpackRequire, initOptions);
      }
      return init(initOptions, capabilities);
    },
  };
  for (const adapter of adapters) {
    Object.assign(bundlerRuntime, adapter.bundlerRuntime);
  }
  return {
    instance: undefined,
    initOptions: undefined,
    bundlerRuntime,
    attachShareScopeMap,
    bundlerRuntimeOptions: {},
  };
}
