import { RemoteHandler } from '../../remote';

export function createRemoteHandler(
  host: ConstructorParameters<typeof RemoteHandler>[0],
): RemoteHandler {
  return new RemoteHandler(host);
}
