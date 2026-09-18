import * as runtime from '@module-federation/runtime';
import { Federation } from './types';
import { attachShareScopeMap } from './attachShareScopeMap';
import { initContainerEntry } from '#mf/container-entry';
import { remotes } from '#mf/remotes';
import {
  consumes,
  getSharedFallbackGetter,
  initializeSharing,
  installInitialConsumes,
} from '#mf/shared-runtime';
import { init } from './init';

export * from './types';

const bundlerRuntime = {
  remotes,
  consumes,
  I: initializeSharing,
  S: {},
  installInitialConsumes,
  initContainerEntry,
  init,
  getSharedFallbackGetter,
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
