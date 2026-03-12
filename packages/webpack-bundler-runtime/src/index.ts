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

export * from './types';

const federation: Federation = {
  runtime,
  instance: undefined,
  initOptions: undefined,
  bundlerRuntime: {
    remotes,
    consumes,
    I: initializeSharing,
    S: {},
    installInitialConsumes,
    initContainerEntry,
    init,
    getSharedFallbackGetter,
  },
  attachShareScopeMap,
  bundlerRuntimeOptions: {},
};

// Keep CJS interop stable for consumers that iterate required keys directly.
export { runtime, attachShareScopeMap };
export const instance = federation.instance;
export const initOptions = federation.initOptions;
export const bundlerRuntime = federation.bundlerRuntime;
export const bundlerRuntimeOptions = federation.bundlerRuntimeOptions;

export default federation;
