import { RemoteScope } from '../types';

/**
 *
 * @returns Generic globally available "sharing scope" container
 */
export const getSharingScope = () => {
  const scope = getScope();

  return scope.__sharing_scope__;
};

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
