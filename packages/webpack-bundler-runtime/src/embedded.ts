//@ts-nocheck
import { Federation } from './types';
import { remotes } from './remotes';
import { consumes } from './consumes';
import { initializeSharing } from './initializeSharing';
import { installInitialConsumes } from './installInitialConsumes';
import { attachShareScopeMap } from './attachShareScopeMap';
import { initContainerEntry } from './initContainerEntry';
export * from './types';

// Access the shared runtime from Webpack's federation plugin
//@ts-ignore
const sharedRuntime = __webpack_require__.federation.sharedRuntime;

// Create a new instance of FederationManager, handling the build identifier
//@ts-ignore
const federationInstance = new sharedRuntime.FederationManager(
  //@ts-ignore
  typeof FEDERATION_BUILD_IDENTIFIER === 'undefined'
    ? undefined
    : //@ts-ignore
      FEDERATION_BUILD_IDENTIFIER,
);

// Bind methods of federationInstance to ensure correct `this` context
// Without using destructuring or arrow functions
const boundInit = federationInstance.init.bind(federationInstance);
const boundGetInstance =
  federationInstance.getInstance.bind(federationInstance);
const boundLoadRemote = federationInstance.loadRemote.bind(federationInstance);
const boundLoadShare = federationInstance.loadShare.bind(federationInstance);
const boundLoadShareSync =
  federationInstance.loadShareSync.bind(federationInstance);
const boundPreloadRemote =
  federationInstance.preloadRemote.bind(federationInstance);
const boundRegisterRemotes =
  federationInstance.registerRemotes.bind(federationInstance);
const boundRegisterPlugins =
  federationInstance.registerPlugins.bind(federationInstance);

// Assemble the federation object with bound methods
const federation: Federation = {
  runtime: {
    // General exports safe to share
    FederationHost: sharedRuntime.FederationHost,
    registerGlobalPlugins: sharedRuntime.registerGlobalPlugins,
    getRemoteEntry: sharedRuntime.getRemoteEntry,
    getRemoteInfo: sharedRuntime.getRemoteInfo,
    loadScript: sharedRuntime.loadScript,
    loadScriptNode: sharedRuntime.loadScriptNode,
    FederationManager: sharedRuntime.FederationManager,
    Module: sharedRuntime.Module,
    // Runtime instance-specific methods with correct `this` binding
    init: boundInit,
    getInstance: boundGetInstance,
    loadRemote: boundLoadRemote,
    loadShare: boundLoadShare,
    loadShareSync: boundLoadShareSync,
    preloadRemote: boundPreloadRemote,
    registerRemotes: boundRegisterRemotes,
    registerPlugins: boundRegisterPlugins,
  },
  instance: undefined,
  initOptions: undefined,
  bundlerRuntime: {
    remotes: remotes,
    consumes: consumes,
    I: initializeSharing,
    S: {},
    installInitialConsumes: installInitialConsumes,
    initContainerEntry: initContainerEntry,
  },
  attachShareScopeMap: attachShareScopeMap,
  bundlerRuntimeOptions: {},
};

export default federation;
