import type {
  AsyncContainer,
  RemoteContainer,
  RemoteOptions,
  SharedScope,
} from '../types';

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
