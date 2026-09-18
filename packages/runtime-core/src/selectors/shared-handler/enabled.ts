import { SharedHandler } from '../../shared';

export function createSharedHandler(
  host: ConstructorParameters<typeof SharedHandler>[0],
): SharedHandler {
  return new SharedHandler(host);
}
