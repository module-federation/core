import { CustomGlobal, RemoteScope } from '../types';

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
    const customGlobal = global as unknown as CustomGlobal;
    if (!customGlobal.__remote_scope__) {
      // create a global scope for container, similar to how remotes are set on window in the browser
      customGlobal.__remote_scope__ = {
        _config: {},
      };
    }

    return customGlobal.__remote_scope__ as unknown as RemoteScope;
  }

  return window as unknown as RemoteScope;
};
