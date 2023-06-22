import { SharingScopeFactory } from '../integrations/common/scopes';
import {
  AsyncContainer,
  RemoteContainer,
  RemoteOptions,
  RemoteScope,
  SharedScopes,
} from '../types';

/**
 * Creates a shell container
 * TODO: Can we standardize a container between node and browser?
 * @param remoteOptions
 */
export const createContainer = (remoteOptions: RemoteOptions) => {
  const containerKey = getContainerKey(remoteOptions);

  const globalScope = getScope();

  if (typeof window === 'undefined') {
    globalScope._config[containerKey] = remoteOptions.url;
  }

  // TODO: Window container created by Webpack?
};

/**
 * Returns a standardize key for the container
 * @param remoteOptions
 * @returns
 */
export const getContainerKey = (
  remoteOptions: string | RemoteOptions
): string => {
  if (remoteOptions === 'string') {
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
export const getContainer = (
  remoteContainer: string | RemoteOptions
): RemoteContainer | undefined => {
  if (!remoteContainer) {
    throw Error(`Remote container options is empty`);
  }

  const containerScope =
    typeof window !== 'undefined' ? window : global.__remote_scope__;

  if (typeof remoteContainer === 'string') {
    if (containerScope[remoteContainer]) {
      return containerScope[remoteContainer] as RemoteContainer;
    }

    return undefined;
  } else {
    const uniqueKey = remoteContainer.uniqueKey as string;
    if (containerScope[uniqueKey]) {
      return containerScope[uniqueKey] as RemoteContainer;
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
  sharedScope: SharedScopes
): Promise<RemoteContainer> => {
  const remoteContainer = await asyncContainer;

  if (!remoteContainer.__initialized && !remoteContainer.__initializing) {
    remoteContainer.__initializing = true;
    await remoteContainer.init(sharedScope);
    remoteContainer.__initialized = true;
    delete remoteContainer.__initializing;
  }

  return remoteContainer;
};

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

    return global.__remote_scope__;
  }

  return window as RemoteScope;
};
