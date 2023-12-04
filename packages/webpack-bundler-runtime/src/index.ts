import * as runtime from '@module-federation/runtime';
import { Federation } from './types';
import { remotes } from './remotes';
import { consumes } from './consumes';
import { initializeSharing } from './initializeSharing';
import { installInitialConsumes } from './installInitialConsumes';
import { proxyShareScopeMap } from './proxyShareScopeMap';

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
  },
  proxyShareScopeMap,
  bundlerRuntimeOptions:{}
};
export default federation;
