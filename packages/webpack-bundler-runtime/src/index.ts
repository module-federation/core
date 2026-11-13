import * as runtime from '@module-federation/runtime';
import { Federation } from './types';
import { remotes } from './remotes';
import { consumes } from './consumes';
import { initializeSharing } from './initializeSharing';
import { installInitialConsumes } from './installInitialConsumes';
import { attachShareScopeMap } from './attachShareScopeMap';
import { initContainerEntry } from './initContainerEntry';
import { init } from './init';
import { getSharedFallbackGetter } from './getSharedFallbackGetter';

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

const bundlerRuntime = {
  remotes: USE_REMOTE ? remotes : undefined,
  consumes: USE_SHARED ? consumes : undefined,
  I: USE_SHARED ? initializeSharing : undefined,
  S: {},
  installInitialConsumes: USE_SHARED ? installInitialConsumes : undefined,
  initContainerEntry: USE_EXPOSES ? initContainerEntry : undefined,
  init,
  getSharedFallbackGetter: USE_SHARED ? getSharedFallbackGetter : undefined,
} as NonNullable<Federation['bundlerRuntime']>;

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
