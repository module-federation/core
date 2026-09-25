import * as runtime from '@module-federation/runtime';
import type { Adapter, Federation, WebpackRequire } from './types';
import { attachShareScopeMap } from './attachShareScopeMap';
import { remotes } from './adapters/remotes';
import { consumes } from './adapters/consumes';
import { shareScope } from './adapters/share-scope';
import { container } from './adapters/container';

declare const FEDERATION_OPTIMIZE_NO_REMOTE: boolean;
declare const FEDERATION_OPTIMIZE_NO_SHARED: boolean;
declare const FEDERATION_HAS_EXPOSES: boolean;

export * from './types';

const USE_REMOTE =
  typeof FEDERATION_OPTIMIZE_NO_REMOTE === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_REMOTE
    : true;
const USE_SHARED =
  typeof FEDERATION_OPTIMIZE_NO_SHARED === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_SHARED
    : true;
const USE_EXPOSES =
  typeof FEDERATION_HAS_EXPOSES === 'boolean' ? FEDERATION_HAS_EXPOSES : true;

const adapters: Adapter[] = [];
if (USE_REMOTE) adapters.push(remotes);
if (USE_SHARED) adapters.push(consumes, shareScope);
if (USE_EXPOSES) adapters.push(container);

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
      return webpackRequire.federation.runtime!.init(initOptions);
    },
  },
  ...adapters.map((adapter) => adapter.bundlerRuntime),
) as NonNullable<Federation['bundlerRuntime']>;

const federation: Federation = {
  runtime,
  instance: undefined,
  initOptions: undefined,
  bundlerRuntime,
  attachShareScopeMap,
  bundlerRuntimeOptions: {},
};

// Keep CJS interop stable for consumers that iterate required keys directly.
export { runtime, attachShareScopeMap };
export const instance = federation.instance;
export const initOptions = federation.initOptions;
export { bundlerRuntime };
export const bundlerRuntimeOptions = federation.bundlerRuntimeOptions;

export default federation;
