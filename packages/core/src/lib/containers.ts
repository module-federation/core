import type {
  AsyncContainer,
  RemoteContainer,
  RemoteOptions,
  SharedScope,
} from '../types';
import { getScope } from './scopes';

/**
 * Creates a shell container on the common scope.
 */
export function registerContainer(
  asyncContainer: AsyncContainer,
  remoteOptions: RemoteOptions,
) {
  const globalScope = getScope();
  const containerKey = getContainerKey(remoteOptions);

  globalScope[containerKey] ??= asyncContainer;
}

/**
 * Returns a standardize key for the container
 */
// TODO: @param remoteOptions -  Should string type be deprecated?
export function getContainerKey(remoteOptions: string | RemoteOptions): string {
  if (typeof remoteOptions === 'string') {
    return remoteOptions;
  }

  return remoteOptions.uniqueKey || remoteOptions.global;
}

/**
 * Returns a remote container if available.
 * @param remoteContainer
 * @returns
 */
// @param remoteContainer -  Should string type be deprecated?
export async function getContainer(
  remoteContainer: string | RemoteOptions,
): Promise<RemoteContainer | undefined> {
  const globalScope = getScope();

  if (!remoteContainer) {
    throw Error(`Remote container options is empty`);
  }

  const uniqueKey = getContainerKey(remoteContainer);
  if (globalScope[uniqueKey]) {
    const container = globalScope[uniqueKey] as AsyncContainer;
    return await container;
  }

  return undefined;
}

/**
 * Initializes a remote container with a shared scope.
 */
export async function initContainer(
  asyncContainer: AsyncContainer,
  sharedScope: SharedScope,
): Promise<RemoteContainer> {
  const remoteContainer = await asyncContainer;

  if (!remoteContainer.__initialized && !remoteContainer.__initializing) {
    remoteContainer.__initializing = true;

    // TODO: check init tokens

    // todo: or remove await or type should be promise<void>
    remoteContainer.init(sharedScope.default);

    remoteContainer.__initialized = true;
    delete remoteContainer.__initializing;
  }

  return remoteContainer;
}
