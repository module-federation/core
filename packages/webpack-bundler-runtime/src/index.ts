import { init } from '@module-federation/runtime';
import type { Adapter, Federation, WebpackRequire } from './types';
import { attachShareScopeMap } from './attachShareScopeMap';
import { remotes } from './adapters/remotes';
import { consumes } from './adapters/consumes';
import { shareScope } from './adapters/share-scope';
import { container } from './adapters/container';

export * from './types';

const adapters: Adapter[] = [remotes, consumes, shareScope, container];

const bundlerRuntime = Object.assign(
  {
    S: {},
    init({ webpackRequire }: { webpackRequire: WebpackRequire }) {
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
  ...adapters.map((adapter) => adapter.bundlerRuntime),
) as NonNullable<Federation['bundlerRuntime']>;

const federation: Federation = {
  instance: undefined,
  initOptions: undefined,
  bundlerRuntime,
  attachShareScopeMap,
  bundlerRuntimeOptions: {},
};

// Keep CJS interop stable for consumers that iterate required keys directly.
export { attachShareScopeMap };
export const instance = federation.instance;
export const initOptions = federation.initOptions;
export { bundlerRuntime };
export const bundlerRuntimeOptions = federation.bundlerRuntimeOptions;

export default federation;
