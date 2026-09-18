import { SharedHandler } from '../../shared';
import { DisabledSharedHandler } from '../../shared/disabled';

declare const FEDERATION_OPTIMIZE_NO_SHARED: boolean;

const useShared =
  typeof FEDERATION_OPTIMIZE_NO_SHARED === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_SHARED
    : true;

export function createSharedHandler(
  host: ConstructorParameters<typeof SharedHandler>[0],
): SharedHandler {
  return (
    useShared ? new SharedHandler(host) : new DisabledSharedHandler()
  ) as SharedHandler;
}
