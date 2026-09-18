import type { RemoteHandler } from '../../remote';
import { DisabledRemoteHandler } from '../../remote/disabled';

export function createRemoteHandler(): RemoteHandler {
  return new DisabledRemoteHandler() as unknown as RemoteHandler;
}
