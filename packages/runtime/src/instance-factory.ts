const {
  FederationManager,
  registerGlobalPlugins,
  getRemoteEntry,
  getRemoteInfo,
  loadScript,
  loadScriptNode,
  //@ts-ignore
} = __webpack_require__.federation.runtime;

const federationManager = new FederationManager();

export const {
  init,
  loadRemote,
  loadShare,
  loadShareSync,
  preloadRemote,
  registerRemotes,
  registerPlugins,
  getInstance,
} = federationManager;

export {
  FederationManager,
  registerGlobalPlugins,
  getRemoteEntry,
  getRemoteInfo,
  loadScript,
  loadScriptNode,
};
