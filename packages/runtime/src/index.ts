import { FederationHost } from './core';
import {
  getGlobalFederationInstance,
  getGlobalFederationConstructor,
  setGlobalFederationInstance,
  setGlobalFederationConstructor,
} from './global';
import { UserOptions, FederationRuntimePlugin } from './type';
import { getBuilderId, getRemoteEntry, getRemoteInfo } from './utils';
import { assert } from './utils/logger';

export { FederationHost } from './core';
export { registerGlobalPlugins } from './global';
import { registerGlobalPlugins, setGlobalShareableRuntime } from './global';
export { getRemoteEntry, getRemoteInfo } from './utils';
export { loadScript, loadScriptNode } from '@module-federation/sdk';
import { loadScript, loadScriptNode } from '@module-federation/sdk';
export { Module } from './module';
import { Module } from './module';
export type { Federation } from './global';
export type { FederationRuntimePlugin };

export class FederationManager {
  private federationInstance: FederationHost | null = null;
  private _bundlerId: string;

  constructor(bundlerId?: string) {
    this._bundlerId = bundlerId || getBuilderId();
    setGlobalFederationConstructor(FederationHost);
  }
  init(options: UserOptions): FederationHost {
    // Retrieve the same instance with the same name
    const instance = getGlobalFederationInstance(
      options.name,
      options.version,
      this._bundlerId,
    );
    if (!instance) {
      // Retrieve debug constructor
      const FederationConstructor =
        getGlobalFederationConstructor() || FederationHost;
      this.federationInstance = new FederationConstructor(
        options,
        this._bundlerId,
      );
      setGlobalFederationInstance(this.federationInstance);
      return this.federationInstance;
    } else {
      // Merge options
      instance.initOptions(options);
      if (!this.federationInstance) {
        this.federationInstance = instance;
      }
      return instance;
    }
  }

  loadRemote<T>(
    ...args: Parameters<FederationHost['loadRemote']>
  ): Promise<T | null> {
    assert(this.federationInstance, 'Please call init first');
    const loadRemote: typeof this.federationInstance.loadRemote<T> =
      this.federationInstance.loadRemote;
    return loadRemote.apply(this.federationInstance, args);
  }

  loadShare<T>(
    ...args: Parameters<FederationHost['loadShare']>
  ): Promise<false | (() => T | undefined)> {
    assert(this.federationInstance, 'Please call init first');
    const loadShare: typeof this.federationInstance.loadShare<T> =
      this.federationInstance.loadShare;
    return loadShare.apply(this.federationInstance, args);
  }

  loadShareSync<T>(
    ...args: Parameters<FederationHost['loadShareSync']>
  ): () => T | never {
    assert(this.federationInstance, 'Please call init first');
    const loadShareSync: typeof this.federationInstance.loadShareSync<T> =
      this.federationInstance.loadShareSync;
    return loadShareSync.apply(this.federationInstance, args);
  }

  preloadRemote(
    ...args: Parameters<FederationHost['preloadRemote']>
  ): ReturnType<FederationHost['preloadRemote']> {
    assert(this.federationInstance, 'Please call init first');
    return this.federationInstance.preloadRemote(...args); // Use spread operator
  }

  registerRemotes(
    ...args: Parameters<FederationHost['registerRemotes']>
  ): ReturnType<FederationHost['registerRemotes']> {
    assert(this.federationInstance, 'Please call init first');
    return this.federationInstance.registerRemotes(...args); // Use spread operator
  }

  registerPlugins(
    ...args: Parameters<FederationHost['registerPlugins']>
  ): ReturnType<FederationHost['registerPlugins']> {
    assert(this.federationInstance, 'Please call init first');
    return this.federationInstance.registerPlugins(...args); // Use spread operator
  }

  getInstance() {
    return this.federationInstance;
  }
}

// Create a singleton instance of the Federation class
const federation = new FederationManager();

// Re-export the functions with the same names
export function init(options: UserOptions): FederationHost {
  return federation.init(options);
}

export function loadRemote<T>(
  ...args: Parameters<FederationHost['loadRemote']>
): Promise<T | null> {
  return federation.loadRemote(...args);
}

export function loadShare<T>(
  ...args: Parameters<FederationHost['loadShare']>
): Promise<false | (() => T | undefined)> {
  return federation.loadShare(...args);
}

export function loadShareSync<T>(
  ...args: Parameters<FederationHost['loadShareSync']>
): () => T | never {
  return federation.loadShareSync(...args);
}

export function preloadRemote(
  ...args: Parameters<FederationHost['preloadRemote']>
): ReturnType<FederationHost['preloadRemote']> {
  return federation.preloadRemote(...args);
}

export function registerRemotes(
  ...args: Parameters<FederationHost['registerRemotes']>
): ReturnType<FederationHost['registerRemotes']> {
  return federation.registerRemotes(...args);
}

export function registerPlugins(
  ...args: Parameters<FederationHost['registerPlugins']>
): ReturnType<FederationHost['registerPlugins']> {
  return federation.registerPlugins(...args);
}

export function getInstance() {
  return federation.getInstance();
}

setGlobalShareableRuntime({
  FederationManager,
  FederationHost,
  loadScript,
  loadScriptNode,
  registerGlobalPlugins,
  getRemoteInfo,
  getRemoteEntry,
  Module,
});
