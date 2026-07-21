import {
  DEFAULT_WEB_SOCKET_PORT,
  WEB_SOCKET_CONNECT_MAGIC_ID,
} from './constant';

// Browser-only module: uses the global `WebSocket` (always present in browsers),
// so no `isomorphic-ws`/`ws` dependency is required here.
export function createWebsocket() {
  return new WebSocket(
    `ws://127.0.0.1:${DEFAULT_WEB_SOCKET_PORT}?WEB_SOCKET_CONNECT_MAGIC_ID=${WEB_SOCKET_CONNECT_MAGIC_ID}`,
  );
}
