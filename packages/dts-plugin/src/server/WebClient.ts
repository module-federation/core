import WebSocket from 'isomorphic-ws';
import { DEFAULT_WEB_SOCKET_PORT } from './constant';
import { Message } from './message/Message';
import { AddWebClientAction } from './message/Action';
import { APIKind, ReloadWebClientAPI } from './message/API';
import { createWebsocket } from './createWebsocket';

type WebClientEnv = 'prod' | 'dev';

export interface WebClientOptions {
  name: string;
  env?: WebClientEnv;
  logPrefix?: string;
}

export class WebClient {
  private _webSocket: WebSocket | null = null;
  private _name: string;
  private logPrefix: string;

  constructor(options: WebClientOptions) {
    this._name = options.name;
    this.logPrefix = options.logPrefix || '';
    this._connect();
  }

  private _connect(): void {
    console.log(
      `${this.logPrefix}Trying to connect to {cyan ws://127.0.0.1:${DEFAULT_WEB_SOCKET_PORT}}...}`,
    );

    this._webSocket = createWebsocket();

    this._webSocket.onopen = () => {
      console.log(
        `${this.logPrefix}Connected to {cyan ws://127.0.0.1:${DEFAULT_WEB_SOCKET_PORT}} success!`,
      );

      const startWebClient = new AddWebClientAction({
        name: this._name,
      });

      this._webSocket && this._webSocket.send(JSON.stringify(startWebClient));
    };

    this._webSocket.onmessage = (message) => {
      console.log(message);
      const parsedMessage: Message = JSON.parse(
        message.data.toString(),
      ) as Message;

      if (parsedMessage.type === 'API') {
        if (parsedMessage.kind === APIKind.RELOAD_WEB_CLIENT) {
          const {
            payload: { name },
          } = parsedMessage as ReloadWebClientAPI;
          if (name !== this._name) {
            return;
          }
          this._reload();
        }
      }
    };

    this._webSocket.onerror = (err) => {
      console.error(`${this.logPrefix}err: ${err}`);
    };
  }

  private _reload(): void {
    console.log(`${this.logPrefix}reload`);
    location.reload();
  }
}
