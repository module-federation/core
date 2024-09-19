import { FederationHost } from './core';
import {
  getGlobalFederationConstructor,
  setGlobalFederationConstructor,
  getGlobalFederationInstance,
  setGlobalFederationInstance,
} from './global';
import { UserOptions, FederationRuntimePlugin } from './type';
import { getBuilderId } from './utils';
import { assert } from './utils/logger';

export { FederationHost } from './core';
export { registerGlobalPlugins } from './global';
export { getRemoteEntry, getRemoteInfo } from './utils';
export { loadScript, loadScriptNode } from '@module-federation/sdk';

export type { Federation } from './global';
export type { FederationRuntimePlugin };

class FederationManager {
  private instance: FederationHost | null = null;
  private _bundlerId: string | undefined;

  constructor(bundlerId?: string) {
    this._bundlerId = bundlerId || getBuilderId();
  }

  getMethods() {
    return {
      init: this.init,
      getInstance: this.getInstance,
      loadRemote: this.loadRemote,
      loadShare: this.loadShare,
      loadShareSync: this.loadShareSync,
      preloadRemote: this.preloadRemote,
      registerRemotes: this.registerRemotes,
      registerPlugins: this.registerPlugins,
    };
  }

  init(options: UserOptions): FederationHost {
    if (!this.instance) {
      const bid = this._bundlerId;
      const existingInstance = getGlobalFederationInstance(
        options.name,
        options.version,
        bid,
      );
      if (
        existingInstance &&
        options.name === 'checkout' &&
        existingInstance.name !== 'checkout'
      ) {
        debugger;
        getGlobalFederationInstance(options.name, options.version, bid);
      }
      debugger;
      if (existingInstance) {
        this.instance = existingInstance;
        this.instance.initOptions(options);
      } else {
        const FederationConstructor =
          getGlobalFederationConstructor() || FederationHost;
        this.instance = new FederationConstructor(options, this._bundlerId);
        if (options.name === 'checkout' && this.instance.name !== 'checkout') {
          debugger;
        }
        setGlobalFederationInstance(this.instance);
      }
    } else {
      this.instance.initOptions(options);
    }

    return this.instance;
  }

  getInstance(): FederationHost | null {
    return this.instance;
  }

  loadRemote<T>(
    ...args: Parameters<FederationHost['loadRemote']>
  ): Promise<T | null> {
    const instance = this.getInstance();
    assert(instance, 'Please call init first');
    return instance.loadRemote(...args);
  }

  loadShare<T>(
    ...args: Parameters<FederationHost['loadShare']>
  ): Promise<false | (() => T | undefined)> {
    const instance = this.getInstance();
    assert(instance, 'Please call init first');
    return instance.loadShare(...args);
  }

  loadShareSync<T>(
    ...args: Parameters<FederationHost['loadShareSync']>
  ): () => T | never {
    const instance = this.getInstance();
    assert(instance, 'Please call init first');
    return instance.loadShareSync(...args);
  }

  preloadRemote(
    ...args: Parameters<FederationHost['preloadRemote']>
  ): ReturnType<FederationHost['preloadRemote']> {
    const instance = this.getInstance();
    assert(instance, 'Please call init first');
    return instance.preloadRemote(...args);
  }

  registerRemotes(
    ...args: Parameters<FederationHost['registerRemotes']>
  ): ReturnType<FederationHost['registerRemotes']> {
    const instance = this.getInstance();
    assert(instance, 'Please call init first');
    return instance.registerRemotes(...args);
  }

  registerPlugins(
    ...args: Parameters<FederationHost['registerPlugins']>
  ): ReturnType<FederationHost['registerRemotes']> {
    const instance = this.getInstance();
    assert(instance, 'Please call init first');
    return instance.registerPlugins(...args);
  }
}

const federationManager = new FederationManager();

export function init(options: UserOptions): FederationHost {
  return federationManager.init(options);
}

export function loadRemote<T>(
  ...args: Parameters<FederationHost['loadRemote']>
): Promise<T | null> {
  return federationManager.loadRemote(...args);
}

export function loadShare<T>(
  ...args: Parameters<FederationHost['loadShare']>
): Promise<false | (() => T | undefined)> {
  return federationManager.loadShare(...args);
}

export function loadShareSync<T>(
  ...args: Parameters<FederationHost['loadShareSync']>
): () => T | never {
  return federationManager.loadShareSync(...args);
}

export function preloadRemote(
  ...args: Parameters<FederationHost['preloadRemote']>
): ReturnType<FederationHost['preloadRemote']> {
  return federationManager.preloadRemote(...args);
}

export function registerRemotes(
  ...args: Parameters<FederationHost['registerRemotes']>
): ReturnType<FederationHost['registerRemotes']> {
  return federationManager.registerRemotes(...args);
}

export function registerPlugins(
  ...args: Parameters<FederationHost['registerPlugins']>
): ReturnType<FederationHost['registerRemotes']> {
  return federationManager.registerPlugins(...args);
}

export function getInstance(): FederationHost | null {
  return federationManager.getInstance();
}

export { FederationManager };

// Inject for debug
setGlobalFederationConstructor(FederationHost);
