import { DisabledRemoteHandler } from '../../remote/disabled';

export function createRemoteHandler() {
  return new DisabledRemoteHandler();
}
