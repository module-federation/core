import WebSocket from 'isomorphic-ws';
import {
  DEFAULT_WEB_SOCKET_PORT,
  WEB_SOCKET_CONNECT_MAGIC_ID,
} from './constant';

export function createWebsocket() {
  return new WebSocket(
    `ws://127.0.0.1:${DEFAULT_WEB_SOCKET_PORT}?WEB_SOCKET_CONNECT_MAGIC_ID=${WEB_SOCKET_CONNECT_MAGIC_ID}`,
  );
}
