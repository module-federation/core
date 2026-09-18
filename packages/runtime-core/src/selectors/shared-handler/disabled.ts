import type { SharedHandler } from '../../shared';
import { DisabledSharedHandler } from '../../shared/disabled';

export function createSharedHandler(): SharedHandler {
  return new DisabledSharedHandler() as unknown as SharedHandler;
}
