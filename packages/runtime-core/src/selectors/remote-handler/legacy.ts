import { RemoteHandler } from '../../remote';
import { DisabledRemoteHandler } from '../../remote/disabled';

declare const FEDERATION_OPTIMIZE_NO_REMOTE: boolean;

const useRemote =
  typeof FEDERATION_OPTIMIZE_NO_REMOTE === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_REMOTE
    : true;

export function createRemoteHandler(
  host: ConstructorParameters<typeof RemoteHandler>[0],
) {
  return useRemote ? new RemoteHandler(host) : new DisabledRemoteHandler();
}
