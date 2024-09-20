import type * as IndexModule from './index';

function getRuntime(): typeof IndexModule {
  // @ts-ignore
  const runtime = __webpack_require__.federation.runtime as typeof IndexModule;
  if (!runtime) {
    throw new Error(
      'Federation runtime accessed before instantiation or installation',
    );
  }
  return runtime;
}

export const registerGlobalPlugins: typeof IndexModule.registerGlobalPlugins = (
  ...args
) => {
  return getRuntime().registerGlobalPlugins(...args);
};

export const getRemoteEntry: typeof IndexModule.getRemoteEntry = (...args) => {
  return getRuntime().getRemoteEntry(...args);
};

export const getRemoteInfo: typeof IndexModule.getRemoteInfo = (...args) => {
  return getRuntime().getRemoteInfo(...args);
};

export const loadScript: typeof IndexModule.loadScript = (...args) => {
  return getRuntime().loadScript(...args);
};

export const loadScriptNode: typeof IndexModule.loadScriptNode = (...args) => {
  return getRuntime().loadScriptNode(...args);
};

export const init: typeof IndexModule.init = (...args) => {
  return getRuntime().init(...args);
};

export const loadRemote: typeof IndexModule.loadRemote = (...args) => {
  return getRuntime().loadRemote(...args);
};

export const loadShare: typeof IndexModule.loadShare = (...args) => {
  return getRuntime().loadShare(...args);
};

export const loadShareSync: typeof IndexModule.loadShareSync = (...args) => {
  return getRuntime().loadShareSync(...args);
};

export const preloadRemote: typeof IndexModule.preloadRemote = (...args) => {
  return getRuntime().preloadRemote(...args);
};

export const registerRemotes: typeof IndexModule.registerRemotes = (
  ...args
) => {
  return getRuntime().registerRemotes(...args);
};

export const registerPlugins: typeof IndexModule.registerPlugins = (
  ...args
) => {
  return getRuntime().registerPlugins(...args);
};

export const getInstance: typeof IndexModule.getInstance = (...args) => {
  return getRuntime().getInstance(...args);
};

export interface FederationHostInterface {
  options: IndexModule.FederationHost['options'];
  hooks: IndexModule.FederationHost['hooks'];
  version: IndexModule.FederationHost['version'];
  name: IndexModule.FederationHost['name'];
  moduleCache: IndexModule.FederationHost['moduleCache'];
  snapshotHandler: IndexModule.FederationHost['snapshotHandler'];
  sharedHandler: IndexModule.FederationHost['sharedHandler'];
  remoteHandler: IndexModule.FederationHost['remoteHandler'];
  shareScopeMap: IndexModule.FederationHost['shareScopeMap'];
  loaderHook: IndexModule.FederationHost['loaderHook'];

  initOptions(
    ...args: Parameters<IndexModule.FederationHost['initOptions']>
  ): ReturnType<IndexModule.FederationHost['initOptions']>;
  loadShare<T>(
    ...args: Parameters<IndexModule.FederationHost['loadShare']>
  ): ReturnType<IndexModule.FederationHost['loadShare']>;
  loadShareSync<T>(
    ...args: Parameters<IndexModule.FederationHost['loadShareSync']>
  ): ReturnType<IndexModule.FederationHost['loadShareSync']>;
  initializeSharing(
    ...args: Parameters<IndexModule.FederationHost['initializeSharing']>
  ): ReturnType<IndexModule.FederationHost['initializeSharing']>;
  initRawContainer(
    ...args: Parameters<IndexModule.FederationHost['initRawContainer']>
  ): ReturnType<IndexModule.FederationHost['initRawContainer']>;
  loadRemote<T>(
    ...args: Parameters<IndexModule.FederationHost['loadRemote']>
  ): ReturnType<IndexModule.FederationHost['loadRemote']>;
  preloadRemote(
    ...args: Parameters<IndexModule.FederationHost['preloadRemote']>
  ): ReturnType<IndexModule.FederationHost['preloadRemote']>;
  initShareScopeMap(
    ...args: Parameters<IndexModule.FederationHost['initShareScopeMap']>
  ): ReturnType<IndexModule.FederationHost['initShareScopeMap']>;
  registerPlugins(
    ...args: Parameters<IndexModule.FederationHost['registerPlugins']>
  ): ReturnType<IndexModule.FederationHost['registerPlugins']>;
  registerRemotes(
    ...args: Parameters<IndexModule.FederationHost['registerRemotes']>
  ): ReturnType<IndexModule.FederationHost['registerRemotes']>;
}

export class FederationHost implements IndexModule.FederationHost {
  private _instance: IndexModule.FederationHost | null = null;
  private _args: ConstructorParameters<typeof IndexModule.FederationHost>;

  constructor(
    ...args: ConstructorParameters<typeof IndexModule.FederationHost>
  ) {
    this._args = args;
    const RealFederationHost = getRuntime().FederationHost;
    this._instance = new RealFederationHost(...this._args);
  }

  private _getInstance(): IndexModule.FederationHost {
    if (!this._instance) {
      const RealFederationHost = getRuntime().FederationHost;
      this._instance = new RealFederationHost(...this._args);
    }
    return this._instance;
  }

  get options() {
    return this._getInstance().options;
  }

  set options(value) {
    this._getInstance().options = value;
  }

  get hooks() {
    return this._getInstance().hooks;
  }

  get version() {
    return this._getInstance().version;
  }

  get name() {
    return this._getInstance().name;
  }

  get moduleCache() {
    return this._getInstance().moduleCache;
  }

  get snapshotHandler() {
    return this._getInstance().snapshotHandler;
  }

  get sharedHandler() {
    return this._getInstance().sharedHandler;
  }

  get remoteHandler() {
    return this._getInstance().remoteHandler;
  }

  get shareScopeMap() {
    return this._getInstance().shareScopeMap;
  }

  get loaderHook() {
    return this._getInstance().loaderHook;
  }

  initOptions(...args: Parameters<IndexModule.FederationHost['initOptions']>) {
    return this._getInstance().initOptions(...args);
  }

  loadShare<T>(...args: Parameters<IndexModule.FederationHost['loadShare']>) {
    return this._getInstance().loadShare<T>(...args);
  }

  loadShareSync<T>(
    ...args: Parameters<IndexModule.FederationHost['loadShareSync']>
  ) {
    return this._getInstance().loadShareSync<T>(...args);
  }

  initializeSharing(
    ...args: Parameters<IndexModule.FederationHost['initializeSharing']>
  ) {
    return this._getInstance().initializeSharing(...args);
  }

  initRawContainer(
    ...args: Parameters<IndexModule.FederationHost['initRawContainer']>
  ) {
    return this._getInstance().initRawContainer(...args);
  }

  loadRemote<T>(...args: Parameters<IndexModule.FederationHost['loadRemote']>) {
    return this._getInstance().loadRemote<T>(...args);
  }

  preloadRemote(
    ...args: Parameters<IndexModule.FederationHost['preloadRemote']>
  ) {
    return this._getInstance().preloadRemote(...args);
  }

  initShareScopeMap(
    ...args: Parameters<IndexModule.FederationHost['initShareScopeMap']>
  ) {
    return this._getInstance().initShareScopeMap(...args);
  }

  registerPlugins(
    ...args: Parameters<IndexModule.FederationHost['registerPlugins']>
  ) {
    return this._getInstance().registerPlugins(...args);
  }

  registerRemotes(
    ...args: Parameters<IndexModule.FederationHost['registerRemotes']>
  ) {
    return this._getInstance().registerRemotes(...args);
  }

  formatOptions(
    ...args: Parameters<IndexModule.FederationHost['formatOptions']>
  ) {
    return this._getInstance().formatOptions(...args);
  }
}

export interface ModuleInterface {
  remoteInfo: IndexModule.Module['remoteInfo'];
  inited: IndexModule.Module['inited'];
  lib: IndexModule.Module['lib'];
  host: IndexModule.Module['host'];

  getEntry(
    ...args: Parameters<IndexModule.Module['getEntry']>
  ): ReturnType<IndexModule.Module['getEntry']>;
  get(
    ...args: Parameters<IndexModule.Module['get']>
  ): ReturnType<IndexModule.Module['get']>;
}

export class Module implements ModuleInterface {
  private _instance: IndexModule.Module | null = null;
  private _args: ConstructorParameters<typeof IndexModule.Module>;

  constructor(...args: ConstructorParameters<typeof IndexModule.Module>) {
    this._args = args;
  }

  private _getInstance(): IndexModule.Module {
    if (!this._instance) {
      const RealModule = getRuntime().Module;
      this._instance = new RealModule(...this._args);
    }
    return this._instance;
  }

  get remoteInfo() {
    return this._getInstance().remoteInfo;
  }

  set remoteInfo(value) {
    this._getInstance().remoteInfo = value;
  }

  get inited() {
    return this._getInstance().inited;
  }

  set inited(value) {
    this._getInstance().inited = value;
  }

  get lib() {
    return this._getInstance().lib;
  }

  set lib(value) {
    this._getInstance().lib = value;
  }

  get host() {
    return this._getInstance().host;
  }

  set host(value) {
    this._getInstance().host = value;
  }

  async getEntry(...args: Parameters<IndexModule.Module['getEntry']>) {
    return this._getInstance().getEntry(...args);
  }

  async get(...args: Parameters<IndexModule.Module['get']>) {
    return this._getInstance().get(...args);
  }
}
