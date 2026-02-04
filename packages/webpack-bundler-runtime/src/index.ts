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
export default federation;
