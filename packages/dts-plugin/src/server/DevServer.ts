import WebSocket from 'isomorphic-ws';
import { UpdateMode } from './constant';
import { Broker } from './broker/Broker';
import { fib, getIdentifier, getIPV4, fileLog } from './utils';
import { Message } from './message/Message';
import { LogKind } from './message/Log';
import {
  AddPublisherAction,
  AddSubscriberAction,
  ExitSubscriberAction,
  ExitPublisherAction,
  NotifyWebClientAction,
  UpdatePublisherAction,
  UpdateKind,
} from './message/Action';
import { APIKind, FetchTypesAPI, UpdateSubscriberAPI } from './message/API';
import { createBroker } from './broker/createBroker';
import { MF_SERVER_IDENTIFIER } from './constant';
import { RemoteInfo } from '../core/interfaces/HostOptions';

export interface UpdateCallbackOptions {
  name: string;
  updateKind: UpdateKind;
  updateMode: UpdateMode;
  remoteTypeTarPath: string;
  updateSourcePaths?: string[];
  remoteInfo?: RemoteInfo;
  once?: boolean;
}

export interface UpdateSubscriberOptions {
  remoteTypeTarPath: string;
  name: string;
  updateKind: UpdateKind;
  updateMode: UpdateMode;
  updateSourcePaths: string[];
  remoteInfo?: RemoteInfo;
}

export type UpdateCallback = (options: UpdateCallbackOptions) => Promise<void>;

export interface ServerUpdateOptions {
  updateKind: UpdateKind;
  updateMode: UpdateMode;
  updateSourcePaths?: string[];
  clientName?: string;
}

export interface Remote {
  name: string;
  entry: string;
  ip: string;
}
interface GarfishModuleContext {
  remotes: Remote[];
  name: string;
  remoteTypeTarPath: string;
  updateCallback: UpdateCallback;
}

export class ModuleFederationDevServer {
  private _remotes: Remote[];
  private _ip: string;
  private _name: string;
  private _remoteTypeTarPath: string;
  private _publishWebSocket: WebSocket | null = null;
  private _subscriberWebsocketMap: Record<string, WebSocket> = {};
  private _reconnect = true;
  private _reconnectTimes = 0;
  private _isConnected = false;
  private _isReconnecting = false;
  private _updateCallback: UpdateCallback = () => Promise.resolve(void 0);

  constructor(ctx: GarfishModuleContext) {
    const { name, remotes, remoteTypeTarPath, updateCallback } = ctx;
    this._ip = getIPV4();
    this._name = name;
    this._remotes = remotes;
    this._remoteTypeTarPath = remoteTypeTarPath;
    this._updateCallback = updateCallback;
    this._stopWhenSIGTERMOrSIGINT();
    this._handleUnexpectedExit();
    this._connectPublishToServer();
  }

  private _connectPublishToServer(): void {
    if (!this._reconnect) {
      return;
    }
    fileLog(
      `Publisher:${this._name} Trying to connect to ws://${this._ip}:${Broker.DEFAULT_WEB_SOCKET_PORT}...`,
      MF_SERVER_IDENTIFIER,
      'info',
    );

    this._publishWebSocket = new WebSocket(
      `ws://${this._ip}:${Broker.DEFAULT_WEB_SOCKET_PORT}?WEB_SOCKET_CONNECT_MAGIC_ID=${Broker.WEB_SOCKET_CONNECT_MAGIC_ID}`,
    );

    this._publishWebSocket.on('open', () => {
      fileLog(
        `Current pid: ${process.pid}, publisher:${this._name} connected to ws://${this._ip}:${Broker.DEFAULT_WEB_SOCKET_PORT}, starting service...`,
        MF_SERVER_IDENTIFIER,
        'info',
      );
      this._isConnected = true;
      const addPublisherAction = new AddPublisherAction({
        name: this._name,
        ip: this._ip,
        remoteTypeTarPath: this._remoteTypeTarPath,
      });
      this._publishWebSocket?.send(JSON.stringify(addPublisherAction));
      this._connectSubscribers();
    });
    this._publishWebSocket.on('message', async (message) => {
      try {
        const parsedMessage: Message = JSON.parse(
          message.toString(),
        ) as Message;
        if (parsedMessage.type === 'Log') {
          if (parsedMessage.kind === LogKind.BrokerExitLog) {
            fileLog(
              `Receive broker exit signal, ${this._name} service will exit...`,
              MF_SERVER_IDENTIFIER,
              'warn',
            );
            this._exit();
          }
        }
        if (parsedMessage.type === 'API') {
          if (parsedMessage.kind === APIKind.FETCH_TYPES) {
            const {
              payload: { remoteInfo },
            } = parsedMessage as FetchTypesAPI;

            fileLog(
              `${
                this._name
              } Receive broker FETCH_TYPES, payload as follows: ${JSON.stringify(
                remoteInfo,
                null,
                2,
              )}.`,
              MF_SERVER_IDENTIFIER,
              'info',
            );

            await this.fetchDynamicRemoteTypes({
              remoteInfo,
            });
          }
        }
      } catch (err) {
        console.error(err);

        const exitPublisher = new ExitPublisherAction({
          name: this._name,
          ip: this._ip,
        });

        const exitSubscriber = new ExitSubscriberAction({
          name: this._name,
          ip: this._ip,
          publishers: this._remotes.map((remote) => ({
            name: remote.name,
            ip: remote.ip,
          })),
        });

        this._publishWebSocket?.send(JSON.stringify(exitPublisher));
        this._publishWebSocket?.send(JSON.stringify(exitSubscriber));
        fileLog(
          'Parse messages error, ModuleFederationDevServer will exit...',
          MF_SERVER_IDENTIFIER,
          'fatal',
        );
        this._exit();
      }
    });

    this._publishWebSocket.on('close', (code) => {
      fileLog(
        `Connection closed with code ${code}.`,
        MF_SERVER_IDENTIFIER,
        'warn',
      );

      this._publishWebSocket && this._publishWebSocket.close();
      this._publishWebSocket = null;

      if (!this._reconnect) {
        return;
      }

      const reconnectTime = fib(++this._reconnectTimes);
      fileLog(
        `start reconnecting to server after ${reconnectTime}s.`,
        MF_SERVER_IDENTIFIER,
        'info',
      );
      setTimeout(() => this._connectPublishToServer(), reconnectTime * 1000);
    });

    this._publishWebSocket.on(
      'error',
      this._tryCreateBackgroundBroker.bind(this),
    );
  }
  // Associate the remotes(Subscriber) to the Broker
  private _connectSubscriberToServer(remote: Remote): void {
    const { name, ip } = remote;

    fileLog(
      `remote module:${name} trying to connect to  ws://${ip}:${Broker.DEFAULT_WEB_SOCKET_PORT}...`,
      MF_SERVER_IDENTIFIER,
      'info',
    );
    const identifier = getIdentifier({
      name,
      ip,
    });
    this._subscriberWebsocketMap[identifier] = new WebSocket(
      `ws://${ip}:${Broker.DEFAULT_WEB_SOCKET_PORT}?WEB_SOCKET_CONNECT_MAGIC_ID=${Broker.WEB_SOCKET_CONNECT_MAGIC_ID}`,
    );

    this._subscriberWebsocketMap[identifier].on('open', () => {
      fileLog(
        `Current pid: ${process.pid} remote module: ${name} connected to ws://${ip}:${Broker.DEFAULT_WEB_SOCKET_PORT}, starting service...`,
        MF_SERVER_IDENTIFIER,
        'info',
      );
      const addSubscriber = new AddSubscriberAction({
        name: this._name, // module self name
        ip: this._ip,
        publishers: [
          {
            name, // remote's name
            ip,
          },
        ],
      });

      this._subscriberWebsocketMap[identifier].send(
        JSON.stringify(addSubscriber),
      );
    });

    this._subscriberWebsocketMap[identifier].on('message', async (message) => {
      try {
        const parsedMessage: Message = JSON.parse(
          message.toString(),
        ) as Message;
        if (parsedMessage.type === 'Log') {
          if (parsedMessage.kind === LogKind.BrokerExitLog) {
            fileLog(
              `${identifier}'s Server exit, thus ${identifier} will no longer has reload ability.`,
              MF_SERVER_IDENTIFIER,
              'warn',
            );
            this._exit();
          }
        }
        if (parsedMessage.type === 'API') {
          if (parsedMessage.kind === APIKind.UPDATE_SUBSCRIBER) {
            const {
              payload: {
                updateKind,
                updateSourcePaths,
                name: subscribeName,
                remoteTypeTarPath,
                updateMode,
              },
            } = parsedMessage as UpdateSubscriberAPI;

            await this._updateSubscriber({
              remoteTypeTarPath,
              name: subscribeName,
              updateKind,
              updateMode,
              updateSourcePaths,
            });
          }
        }
      } catch (err) {
        console.error(err);
        const exitSubscriber = new ExitSubscriberAction({
          name: this._name,
          ip: this._ip,
          publishers: [
            {
              name,
              ip,
            },
          ],
        });

        this._subscriberWebsocketMap[identifier].send(
          JSON.stringify(exitSubscriber),
        );
        fileLog(
          `${identifier} exit,
        error: ${err instanceof Error ? err.toString() : JSON.stringify(err)}
        `,
          MF_SERVER_IDENTIFIER,
          'warn',
        );
      }
    });

    this._subscriberWebsocketMap[identifier].on('close', (code) => {
      fileLog(
        `Connection closed with code ${code}.`,
        MF_SERVER_IDENTIFIER,
        'warn',
      );

      this._subscriberWebsocketMap[identifier]?.close();
      delete this._subscriberWebsocketMap[identifier];
    });

    this._subscriberWebsocketMap[identifier].on('error', (err) => {
      if ('code' in err && err.code === 'ETIMEDOUT') {
        fileLog(
          `Can not connect ${JSON.stringify(remote)}, please make sure this remote is started locally.`,
          MF_SERVER_IDENTIFIER,
          'warn',
        );
      } else {
        console.error(err);
      }
      this._subscriberWebsocketMap[identifier]?.close();
      delete this._subscriberWebsocketMap[identifier];
    });
  }

  private _connectSubscribers(): void {
    this._remotes.forEach((remote) => {
      this._connectSubscriberToServer(remote);
    });
  }

  // app1 consumes provider1. And the function will be triggered when provider1 code change.
  private async _updateSubscriber(
    options: UpdateSubscriberOptions,
  ): Promise<void> {
    const {
      updateMode,
      updateKind,
      updateSourcePaths,
      name,
      remoteTypeTarPath,
      remoteInfo,
    } = options;
    fileLog(
      // eslint-disable-next-line max-len
      `[_updateSubscriber] run, options: ${JSON.stringify(options, null, 2)}`,
      MF_SERVER_IDENTIFIER,
      'warn',
    );
    if (
      updateMode === UpdateMode.PASSIVE &&
      updateSourcePaths.includes(this._name)
    ) {
      fileLog(
        // eslint-disable-next-line max-len
        `[_updateSubscriber] run, updateSourcePaths:${updateSourcePaths} includes ${this._name}, update ignore!`,
        MF_SERVER_IDENTIFIER,
        'warn',
      );
      return;
    }

    if (updateSourcePaths.slice(-1)[0] === this._name) {
      // eslint-disable-next-line max-len
      fileLog(
        `[_updateSubscriber] run, updateSourcePaths:${updateSourcePaths} ends is ${this._name}, update ignore!`,
        MF_SERVER_IDENTIFIER,
        'warn',
      );
      return;
    }
    fileLog(
      // eslint-disable-next-line max-len
      `[_updateSubscriber] run, updateSourcePaths:${updateSourcePaths}, current module:${this._name}, update start...`,
      MF_SERVER_IDENTIFIER,
      'info',
    );
    await this._updateCallback({
      name,
      updateMode,
      updateKind,
      updateSourcePaths,
      remoteTypeTarPath,
      remoteInfo,
    });
    const newUpdateSourcePaths = updateSourcePaths.concat(this._name);
    const updatePublisher = new UpdatePublisherAction({
      name: this._name,
      ip: this._ip,
      updateMode: UpdateMode.PASSIVE,
      updateKind,
      updateSourcePaths: newUpdateSourcePaths,
      remoteTypeTarPath: this._remoteTypeTarPath,
    });
    fileLog(
      // eslint-disable-next-line max-len
      `[_updateSubscriber] run, updateSourcePaths:${newUpdateSourcePaths}, update publisher ${this._name} start...`,
      MF_SERVER_IDENTIFIER,
      'info',
    );
    this._publishWebSocket?.send(JSON.stringify(updatePublisher));
  }

  private _tryCreateBackgroundBroker(err: any): void {
    if (
      !(
        err?.code === 'ECONNREFUSED' &&
        err.port === Broker.DEFAULT_WEB_SOCKET_PORT
      )
    ) {
      fileLog(`websocket error: ${err.stack}`, MF_SERVER_IDENTIFIER, 'fatal');
      return;
    }
    fileLog(
      `Failed to connect to ws://${this._ip}:${Broker.DEFAULT_WEB_SOCKET_PORT}...`,
      MF_SERVER_IDENTIFIER,
      'fatal',
    );
    this._isReconnecting = true;
    setTimeout(
      () => {
        this._isReconnecting = false;
        if (this._reconnect === false) {
          return;
        }
        fileLog(
          'Creating new background broker...',
          MF_SERVER_IDENTIFIER,
          'warn',
        );
        const broker = createBroker();

        broker.on('message', (message) => {
          if (message === 'ready') {
            fileLog('background broker started.', MF_SERVER_IDENTIFIER, 'info');
            this._reconnectTimes = 1;
            if (process.send) {
              process.send('ready');
            }
          }
        });
      },
      Math.ceil(100 * Math.random()),
    );
  }

  private _stopWhenSIGTERMOrSIGINT(): void {
    process.on('SIGTERM', () => {
      fileLog(
        `Process(${process.pid}) SIGTERM, ModuleFederationDevServer will exit...`,
        MF_SERVER_IDENTIFIER,
        'warn',
      );
      this._exit();
    });

    process.on('SIGINT', () => {
      fileLog(
        `Process(${process.pid}) SIGINT, ModuleFederationDevServer will exit...`,
        MF_SERVER_IDENTIFIER,
        'warn',
      );
      this._exit();
    });
  }

  private _handleUnexpectedExit(): void {
    process.on('unhandledRejection', (error) => {
      if (this._isReconnecting) {
        return;
      }
      console.error('Unhandled Rejection Error: ', error);
      fileLog(
        `Process(${process.pid}) unhandledRejection, garfishModuleServer will exit...`,
        MF_SERVER_IDENTIFIER,
        'error',
      );
      this._exit();
    });
    process.on('uncaughtException', (error) => {
      if (this._isReconnecting) {
        return;
      }
      console.error('Unhandled Exception Error: ', error);
      fileLog(
        `Process(${process.pid}) uncaughtException, garfishModuleServer will exit...`,
        MF_SERVER_IDENTIFIER,
        'error',
      );
      this._exit();
    });
  }

  private _exit(): void {
    this._reconnect = false;
    if (this._publishWebSocket) {
      const exitPublisher = new ExitPublisherAction({
        name: this._name,
        ip: this._ip,
      });
      this._publishWebSocket.send(JSON.stringify(exitPublisher));
      this._publishWebSocket.on('message', (message) => {
        const parsedMessage: Message = JSON.parse(
          message.toString(),
        ) as Message;
        fileLog(
          `[${parsedMessage.kind}]: ${JSON.stringify(parsedMessage)}`,
          MF_SERVER_IDENTIFIER,
          'info',
        );
      });
    }
    if (this._publishWebSocket) {
      this._publishWebSocket.close();
      this._publishWebSocket = null;
    }

    process.exit(0);
  }

  exit(): void {
    this._exit();
  }

  update(options: ServerUpdateOptions): void {
    if (!this._publishWebSocket || !this._isConnected) {
      return;
    }
    const { updateKind, updateMode, updateSourcePaths, clientName } = options;
    fileLog(
      `update run, ${this._name} module update, updateKind: ${updateKind}, updateMode: ${updateMode}, updateSourcePaths: ${updateSourcePaths}`,
      MF_SERVER_IDENTIFIER,
      'info',
    );
    if (updateKind === UpdateKind.RELOAD_PAGE) {
      const notifyWebClient = new NotifyWebClientAction({
        name: clientName || this._name,
        updateMode,
      });
      this._publishWebSocket.send(JSON.stringify(notifyWebClient));
      return;
    }

    const updatePublisher = new UpdatePublisherAction({
      name: this._name,
      ip: this._ip,
      updateMode,
      updateKind,
      updateSourcePaths: [this._name],
      remoteTypeTarPath: this._remoteTypeTarPath,
    });
    this._publishWebSocket.send(JSON.stringify(updatePublisher));
  }

  async fetchDynamicRemoteTypes(options: {
    remoteInfo: RemoteInfo;
    once?: boolean;
  }) {
    const { remoteInfo, once } = options;
    const updateMode = UpdateMode.PASSIVE;
    const updateKind = UpdateKind.UPDATE_TYPE;
    fileLog(
      `fetchDynamicRemoteTypes: remoteInfo: ${JSON.stringify(remoteInfo)}`,
      MF_SERVER_IDENTIFIER,
      'info',
    );
    await this._updateCallback({
      name: this._name,
      updateMode,
      updateKind,
      updateSourcePaths: [],
      remoteTypeTarPath: '',
      remoteInfo,
      once,
    });

    const updatePublisher = new UpdatePublisherAction({
      name: this._name,
      ip: this._ip,
      updateMode,
      updateKind,
      updateSourcePaths: [this._name],
      remoteTypeTarPath: this._remoteTypeTarPath,
    });
    this._publishWebSocket.send(JSON.stringify(updatePublisher));
  }
}
