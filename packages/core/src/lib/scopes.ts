import { RemoteScope, SharedScope } from '../types';
import { WebpackSharingScopeFactory } from '../integrations/webpack/factory';
import { isWebpackAvailable } from './bundlers';

// TODO: We need a centralized scope container
export const SharingScopeFactory = {
  initializeSharingScope: (scopeName = 'default'): Promise<SharedScope> => {
    if (isWebpackAvailable()) {
      return new WebpackSharingScopeFactory().initializeSharingScope(scopeName);
    }

    // TODO: Create a default scope?
    return Promise.resolve({
      default: {},
    });
  },
};

/**
 * Create a shared scope ("shared space") if it doesn't exist, on the global common scope.
 * @param scopeName
 * @returns
 */
export const createSharingScope = async (scopeName = 'default') => {
  const scope = getScope();

  if (typeof scope.__sharing_scope__ === 'undefined') {
    const sharedScope = await SharingScopeFactory.initializeSharingScope(
      scopeName
    );

    scope.__sharing_scope__ = sharedScope;
  }

  return scope.__sharing_scope__;
};

export const getSharingScope = () => createSharingScope();

/**
 *
 * @returns Generic globally available "scope" container
 */
export const getScope = (): RemoteScope => {
  if (typeof window === 'undefined') {
    if (!global.__remote_scope__) {
      // create a global scope for container, similar to how remotes are set on window in the browser
      global.__remote_scope__ = {
        _config: {},
      };
    }

    return global.__remote_scope__;
  }

  return window as unknown as RemoteScope;
};
