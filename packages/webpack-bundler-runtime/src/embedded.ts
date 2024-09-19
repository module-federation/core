import { Federation } from './types';
import { remotes } from './remotes';
import { consumes } from './consumes';
import { initializeSharing } from './initializeSharing';
import { installInitialConsumes } from './installInitialConsumes';
import { attachShareScopeMap } from './attachShareScopeMap';
import { initContainerEntry } from './initContainerEntry';

export * from './types';
//@ts-ignore
const sharedRuntime = __webpack_require__.federation.sharedRuntime;

const federationInstance = new sharedRuntime.FederationManager(
  //@ts-ignore
  typeof FEDERATION_BUILD_IDENTIFIER === 'undefined'
    ? undefined
    : FEDERATION_BUILD_IDENTIFIER,
);

const federation: Federation = {
  runtime: {
    //general exports safe to share
    FederationHost: sharedRuntime.FederationHost,
    registerGlobalPlugins: sharedRuntime.registerGlobalPlugins,
    getRemoteEntry: sharedRuntime.getRemoteEntry,
    getRemoteInfo: sharedRuntime.getRemoteInfo,
    loadScript: sharedRuntime.loadScript,
    loadScriptNode: sharedRuntime.loadScriptNode,
    FederationManager: sharedRuntime.FederationManager,
    // runtime instance specific
    init: federationInstance.init,
    getInstance: federationInstance.getInstance,
    loadRemote: federationInstance.loadRemote,
    loadShare: federationInstance.loadShare,
    loadShareSync: federationInstance.loadShareSync,
    preloadRemote: federationInstance.preloadRemote,
    registerRemotes: federationInstance.registerRemotes,
    registerPlugins: federationInstance.registerPlugins,
  },
  instance: undefined,
  initOptions: undefined,
  bundlerRuntime: {
    remotes,
    consumes,
    I: initializeSharing,
    S: {},
    installInitialConsumes,
    initContainerEntry,
  },
  attachShareScopeMap,
  bundlerRuntimeOptions: {},
};
export default federation;
