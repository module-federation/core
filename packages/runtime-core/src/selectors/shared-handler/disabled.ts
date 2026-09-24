import { DisabledSharedHandler } from '../../shared/disabled';

export function createSharedHandler() {
  return new DisabledSharedHandler();
}
