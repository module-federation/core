import { getScope } from './scopes';
import {
  AsyncContainer,
  RemoteContainer,
  RemoteOptions,
  SharedScope,
} from '../types';

/**
 * Creates a shell container on the common scope.
 * @param remoteOptions
 */
export const registerContainer = (
  asyncContainer: AsyncContainer,
  remoteOptions: RemoteOptions
) => {
  const containerKey = getContainerKey(remoteOptions);

  const globalScope = getScope();

  if (globalScope[containerKey]) return;

  globalScope[containerKey] = asyncContainer;
};

/**
 * Returns a standardize key for the container
 * @param remoteOptions
 * @returns
 */
export const getContainerKey = (
  remoteOptions: string | RemoteOptions // TODO: Should string be deprecated?
): string => {
  if (typeof remoteOptions === 'string') {
    return remoteOptions as string;
  }

  const options = remoteOptions as RemoteOptions;

  return options.uniqueKey ? options.uniqueKey : options.global;
};

/**
 * Returns a remote container if available.
 * @param remoteContainer
 * @returns
 */
export const getContainer = async (
  remoteContainer: string | RemoteOptions // TODO: Should string be deprecated?
): Promise<RemoteContainer | undefined> => {
  if (!remoteContainer) {
    throw Error(`Remote container options is empty`);
  }
  const containerScope = getScope();

  if (typeof remoteContainer === 'string') {
    if (containerScope[remoteContainer]) {
      const container = containerScope[remoteContainer] as AsyncContainer;
      return await container;
    }

    return undefined;
  } else {
    const uniqueKey = getContainerKey(remoteContainer);
    if (containerScope[uniqueKey]) {
      const container = containerScope[uniqueKey] as AsyncContainer;
      return await container;
    }

    return undefined;
  }
};

/**
 * Initializes a remote container with a shared scope.
 * @param remoteContainer
 * @param sharedScope
 */
export const initContainer = async (
  asyncContainer: AsyncContainer,
  sharedScope: SharedScope
): Promise<RemoteContainer> => {
  const remoteContainer = await asyncContainer;

  if (!remoteContainer.__initialized && !remoteContainer.__initializing) {
    remoteContainer.__initializing = true;
    // TODO: check init tokens
    await remoteContainer.init(sharedScope);
    remoteContainer.__initialized = true;
    delete remoteContainer.__initializing;
  }

  return remoteContainer;
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
      // @ts-ignore
      global.__remote_scope__ = {
        // @ts-ignore
        _config: {},
      };
    }

    console.log('Scope: ', global.__remote_scope__);

    return global.__remote_scope__;
  }

  return window as unknown as RemoteScope;
};
