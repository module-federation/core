import {
  connectDevframe,
  type DevframeRpcClientOptions,
} from 'devframe/client';
import { createModuleFederationReader } from './reader';
/** Call explicitly from the application page, in development only. */
export async function connectModuleFederationDevframe(
  options: DevframeRpcClientOptions = {},
) {
  if (typeof window === 'undefined')
    throw new Error(
      'Connect the Module Federation reader inside the browser application.',
    );
  const client = await connectDevframe({
    ...options,
    cacheOptions: false,
    callTimeout: 5000,
  });
  client.client.register({
    name: 'module-federation:read-snapshot',
    type: 'query',
    jsonSerializable: true,
    handler: createModuleFederationReader(),
  });
  const register = () =>
    client.scope('module-federation').rpc.call('connect-reader');
  const off = client.events.on('connection:status', (status) => {
    if (status === 'connected') void register().catch(() => {});
  });
  try {
    await register();
  } catch (error) {
    off();
    client.close?.();
    throw error;
  }
  return {
    close() {
      off();
      client.close?.();
    },
  };
}
