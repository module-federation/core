import { IncomingMessage, createServer } from 'http';
import { UpdateMode } from '../constant';
import WebSocket from 'isomorphic-ws';
import schedule from 'node-schedule';
import { parse } from 'url';
import { Publisher } from '../Publisher';
import { getIdentifier, fileLog, error } from '../utils';
import { ReloadWebClientAPI } from '../message/API';
import {
  ConnectionAuthQuery,
  Action,
  BaseContext,
  TmpSubscriberShelter,
  TmpSubscriberShelterSubscriber,
  TmpSubscriberShelterSubscribers,
  Publisher as IPublisher,
} from '../types';
import { BrokerExitLog } from '../message/Log';
import {
  ActionKind,
  AddSubscriberActionPayload,
  ExitSubscriberActionPayload,
  UpdatePublisherActionPayload,
  NotifyWebClientActionPayload,
  AddWebClientActionPayload,
  AddPublisherActionPayload,
  UpdateKind,
  FetchTypesPayload,
  AddDynamicRemotePayload,
} from '../message/Action';
import {
  DEFAULT_WEB_SOCKET_PORT,
  WEB_SOCKET_CONNECT_MAGIC_ID as DEFAULT_WEB_SOCKET_CONNECT_MAGIC_ID,
} from '../constant';
export class Broker {
  static readonly WEB_SOCKET_CONNECT_MAGIC_ID =
    DEFAULT_WEB_SOCKET_CONNECT_MAGIC_ID;
  static readonly DEFAULT_WEB_SOCKET_PORT = DEFAULT_WEB_SOCKET_PORT;
  static readonly DEFAULT_SECURE_WEB_SOCKET_PORT = 16324;
  static readonly DEFAULT_WAITING_TIME = 1.5 * 60 * 60 * 1000; // 1.5h

  private _publisherMap: Map<string, Publisher> = new Map();
  private _webClientMap: Map<string, WebSocket> = new Map();
  private _webSocketServer?: WebSocket.Server;
  private _secureWebSocketServer?: WebSocket.Server;
  private _tmpSubscriberShelter: TmpSubscriberShelter = new Map();
  private _scheduleJob: schedule.Job | null = null;

  constructor() {
    this._setSchedule();
    this._startWsServer();
    this._stopWhenSIGTERMOrSIGINT();
    this._handleUnexpectedExit();
  }

  get hasPublishers(): boolean {
    return Boolean(this._publisherMap.size);
  }

  private async _startWsServer(): Promise<void> {
    const wsHandler = (ws: WebSocket, req: IncomingMessage): void => {
      const { url: reqUrl = '' } = req;
      const { query } = parse(reqUrl, true);
      const { WEB_SOCKET_CONNECT_MAGIC_ID } =
        query as unknown as ConnectionAuthQuery;
      if (WEB_SOCKET_CONNECT_MAGIC_ID === Broker.WEB_SOCKET_CONNECT_MAGIC_ID) {
        ws.on('message', (message) => {
          try {
            const text = message.toString();
            const action = JSON.parse(text) as Action;
            fileLog(`${action?.kind} action received `, 'Broker', 'info');
            this._takeAction(action, ws);
          } catch (error) {
            fileLog(`parse action message error: ${error}`, 'Broker', 'error');
          }
        });
        ws.on('error', (e: any) => {
          fileLog(`parse action message error: ${e}`, 'Broker', 'error');
        });
      } else {
        ws.send('Invalid CONNECT ID.');
        fileLog('Invalid CONNECT ID.', 'Broker', 'warn');
        ws.close();
      }
    };

    const server = createServer();

    this._webSocketServer = new WebSocket.Server({ noServer: true });
    this._webSocketServer.on('error', (err) => {
      fileLog(`ws error: \n${err.message}\n ${err.stack}`, 'Broker', 'error');
    });
    this._webSocketServer.on('listening', () => {
      fileLog(
        `WebSocket server is listening on port ${Broker.DEFAULT_WEB_SOCKET_PORT}`,
        'Broker',
        'info',
      );
    });
    this._webSocketServer.on('connection', wsHandler);
    this._webSocketServer.on('close', (code: any) => {
      fileLog(`WebSocket Server Close with Code ${code}`, 'Broker', 'warn');
      this._webSocketServer && this._webSocketServer.close();
      this._webSocketServer = undefined;
    });

    server.on('upgrade', (req, socket, head) => {
      if (req.url) {
        const { pathname } = parse(req.url);

        if (pathname === '/') {
          this._webSocketServer?.handleUpgrade(req, socket, head, (ws) => {
            this._webSocketServer?.emit('connection', ws, req);
          });
        }
      }
    });
    server.listen(Broker.DEFAULT_WEB_SOCKET_PORT);

    // const httpServer = createServer();

    // this._secureWebSocketServer = new WebSocket.Server({ server: httpServer });
    // this._secureWebSocketServer.on('error', log);
    // this._secureWebSocketServer.on('listening', () => {
    //   fileLog(
    //     `Secure WebSocket server is listening on port ${Broker.DEFAULT_SECURE_WEB_SOCKET_PORT}`,
    //     'Broker',
    //     'info'
    //   );
    // });
    // this._secureWebSocketServer.on('close', code => {
    //   fileLog(
    //     `Secure WebSocket Server Close with Code ${code}`,
    //     'Broker',
    //     'warn'
    //   );
    //   this._secureWebSocketServer && this._secureWebSocketServer.close();
    //   this._secureWebSocketServer = null;
    // });
    // this._secureWebSocketServer.on('connection', wsHandler);
    // httpServer.listen(Broker.DEFAULT_SECURE_WEB_SOCKET_PORT);
  }

  private async _takeAction(action: Action, client: WebSocket): Promise<void> {
    const { kind, payload } = action;

    if (kind === ActionKind.ADD_PUBLISHER) {
      await this._addPublisher(payload as AddPublisherActionPayload, client);
    }

    if (kind === ActionKind.UPDATE_PUBLISHER) {
      await this._updatePublisher(
        payload as UpdatePublisherActionPayload,
        client,
      );
    }
    if (kind === ActionKind.ADD_SUBSCRIBER) {
      await this._addSubscriber(payload as AddSubscriberActionPayload, client);
    }

    if (kind === ActionKind.EXIT_SUBSCRIBER) {
      await this._removeSubscriber(
        payload as ExitSubscriberActionPayload,
        client,
      );
    }

    if (kind === ActionKind.EXIT_PUBLISHER) {
      await this._removePublisher(payload as BaseContext, client);
    }

    if (kind === ActionKind.ADD_WEB_CLIENT) {
      await this._addWebClient(payload as AddWebClientActionPayload, client);
    }

    if (kind === ActionKind.NOTIFY_WEB_CLIENT) {
      await this._notifyWebClient(
        payload as NotifyWebClientActionPayload,
        client,
      );
    }

    if (kind === ActionKind.FETCH_TYPES) {
      await this._fetchTypes(payload as FetchTypesPayload, client);
    }

    if (kind === ActionKind.ADD_DYNAMIC_REMOTE) {
      this._addDynamicRemote(payload as AddDynamicRemotePayload);
    }
  }
  private async _addPublisher(
    context: AddPublisherActionPayload,
    client: WebSocket,
  ): Promise<void> {
    const { name, ip, remoteTypeTarPath } = context ?? {};
    const identifier = getIdentifier({ name, ip });
    if (this._publisherMap.has(identifier)) {
      fileLog(
        `[${ActionKind.ADD_PUBLISHER}] ${identifier} has been added, this action will be ignored`,
        'Broker',
        'warn',
      );
      return;
    }

    try {
      const publisher = new Publisher({
        name,
        ip,
        remoteTypeTarPath,
        ws: client,
      });
      this._publisherMap.set(identifier, publisher);
      fileLog(
        `[${ActionKind.ADD_PUBLISHER}] ${identifier} Adding Publisher Succeed`,
        'Broker',
        'info',
      );
      // check ths publisher if has been consumed/subscribed by (launched) consumer
      const tmpSubScribers = this._getTmpSubScribers(identifier);
      if (tmpSubScribers) {
        //  app1 consumes provider1, and app1 launch before provider1. Dependencies at this time: publisher:provider1, tmpSubScribers: app1
        fileLog(
          `[${ActionKind.ADD_PUBLISHER}] consumeTmpSubscriber set ${publisher.name}’s subscribers `,
          'Broker',
          'info',
        );
        this._consumeTmpSubScribers(publisher, tmpSubScribers);
        this._clearTmpSubScriberRelation(identifier);
      }
    } catch (err) {
      const msg = error(err, ActionKind.ADD_PUBLISHER, 'Broker');
      client.send(msg);
      client.close();
    }
  }

  private async _updatePublisher(
    context: UpdatePublisherActionPayload,
    client: WebSocket,
  ): Promise<void> {
    const {
      name,
      updateMode,
      updateKind,
      updateSourcePaths,
      remoteTypeTarPath,
      ip,
    } = context ?? {};
    const identifier = getIdentifier({ name, ip });

    if (!this._publisherMap.has(identifier)) {
      fileLog(
        `[${
          ActionKind.UPDATE_PUBLISHER
        }] ${identifier} has not been started, this action will be ignored
        this._publisherMap: ${JSON.stringify(this._publisherMap.entries())}
        `,
        'Broker',
        'warn',
      );
      return;
    }

    try {
      const publisher = this._publisherMap.get(identifier);
      fileLog(
        // eslint-disable-next-line max-len
        `[${ActionKind.UPDATE_PUBLISHER}] ${identifier} update, and notify subscribers to update`,
        'Broker',
        'info',
      );
      if (publisher) {
        publisher.notifySubscribers({
          remoteTypeTarPath,
          name,
          updateMode,
          updateKind,
          updateSourcePaths: updateSourcePaths || [],
        });

        // update dynamic remote as well
        this._publisherMap.forEach((p) => {
          if (p.name === publisher.name) {
            return;
          }
          const dynamicRemoteInfo = p.dynamicRemoteMap.get(identifier);
          if (dynamicRemoteInfo) {
            fileLog(
              // eslint-disable-next-line max-len
              `dynamicRemoteInfo: ${JSON.stringify(
                dynamicRemoteInfo,
              )}, identifier:${identifier} publish: ${p.name}`,
              'Broker',
              'info',
            );
            p.fetchRemoteTypes({
              remoteInfo: dynamicRemoteInfo,
              once: false,
            });
          }
        });
      }
    } catch (err) {
      const msg = error(err, ActionKind.UPDATE_PUBLISHER, 'Broker');
      client.send(msg);
      client.close();
    }
  }

  private async _fetchTypes(context: FetchTypesPayload, _client: WebSocket) {
    const { name, ip, remoteInfo } = context ?? {};
    const identifier = getIdentifier({ name, ip });
    try {
      const publisher = this._publisherMap.get(identifier);
      fileLog(
        `[${ActionKind.FETCH_TYPES}] ${identifier} fetch types`,
        'Broker',
        'info',
      );
      if (publisher) {
        publisher.fetchRemoteTypes({
          remoteInfo,
          once: true,
        });
      }
    } catch (err) {
      fileLog(
        `[${ActionKind.FETCH_TYPES}] ${identifier} fetch types fail , error info: ${err}`,
        'Broker',
        'error',
      );
    }
  }

  private _addDynamicRemote(context: AddDynamicRemotePayload) {
    const { name, ip, remoteInfo, remoteIp } = context ?? {};
    const identifier = getIdentifier({ name, ip });
    const publisher = this._publisherMap.get(identifier);
    const remoteId = getIdentifier({ name: remoteInfo.name, ip: remoteIp });
    fileLog(
      `[${ActionKind.ADD_DYNAMIC_REMOTE}] identifier:${identifier},publisher: ${publisher.name}, remoteId:${remoteId}`,
      'Broker',
      'error',
    );
    if (!publisher || publisher.dynamicRemoteMap.has(remoteId)) {
      return;
    }
    publisher.dynamicRemoteMap.set(remoteId, remoteInfo);
  }
  //  app1 consumes provider1,provider2. Dependencies at this time: publishers: [provider1, provider2], subscriberName: app1
  // provider1 is app1's remote
  private async _addSubscriber(
    context: AddSubscriberActionPayload,
    client: WebSocket,
  ): Promise<void> {
    const { publishers, name: subscriberName } = context ?? {};

    publishers.forEach((publisher) => {
      const { name, ip } = publisher;
      const identifier = getIdentifier({ name, ip });
      if (!this._publisherMap.has(identifier)) {
        fileLog(
          `[${ActionKind.ADD_SUBSCRIBER}]: ${identifier} has not been started, ${subscriberName} will add the relation to tmp shelter`,
          'Broker',
          'warn',
        );
        // ({name: 'app1${ip}', client}, {name: 'provider1'})
        this._addTmpSubScriberRelation(
          {
            name: getIdentifier({
              name: context.name,
              ip: context.ip,
            }),
            client,
          },
          publisher,
        );

        return;
      }

      try {
        const registeredPublisher = this._publisherMap.get(identifier);
        if (registeredPublisher) {
          registeredPublisher.addSubscriber(
            getIdentifier({
              name: subscriberName,
              ip: context.ip,
            }),
            client,
          );
          fileLog(
            // eslint-disable-next-line @ies/eden/max-calls-in-template
            `[${
              ActionKind.ADD_SUBSCRIBER
            }]: ${identifier} has been started, Adding Subscriber ${subscriberName} Succeed, this.__publisherMap are: ${JSON.stringify(
              Array.from(this._publisherMap.entries()),
            )}`,
            'Broker',
            'info',
          );
          registeredPublisher.notifySubscriber(
            getIdentifier({
              name: subscriberName,
              ip: context.ip,
            }),
            {
              updateKind: UpdateKind.UPDATE_TYPE,
              updateMode: UpdateMode.PASSIVE,
              updateSourcePaths: [registeredPublisher.name],
              remoteTypeTarPath: registeredPublisher.remoteTypeTarPath,
              name: registeredPublisher.name,
            },
          );
          fileLog(
            // eslint-disable-next-line @ies/eden/max-calls-in-template
            `[${ActionKind.ADD_SUBSCRIBER}]: notifySubscriber Subscriber ${subscriberName}, updateMode: "PASSIVE",  updateSourcePaths: ${registeredPublisher.name}`,
            'Broker',
            'info',
          );
        }
      } catch (err) {
        const msg = error(err, ActionKind.ADD_SUBSCRIBER, 'Broker');
        client.send(msg);
        client.close();
      }
    });
  }
  // Trigger while consumer exit
  private async _removeSubscriber(
    context: ExitSubscriberActionPayload,
    client: WebSocket,
  ): Promise<void> {
    // publishers 代指 remotes 模块
    const { publishers } = context ?? {};
    const subscriberIdentifier = getIdentifier({
      name: context?.name,
      ip: context?.ip,
    });
    publishers.forEach((publisher) => {
      const { name, ip } = publisher;
      const identifier = getIdentifier({
        name,
        ip,
      });
      const registeredPublisher = this._publisherMap.get(identifier);

      if (!registeredPublisher) {
        fileLog(
          `[${ActionKind.EXIT_SUBSCRIBER}], ${identifier} does not exit `,
          'Broker',
          'warn',
        );
        return;
      }

      try {
        fileLog(
          `[${ActionKind.EXIT_SUBSCRIBER}], ${identifier} will exit `,
          'Broker',
          'INFO',
        );
        registeredPublisher.removeSubscriber(subscriberIdentifier);
        this._clearTmpSubScriberRelation(identifier);

        if (!registeredPublisher.hasSubscribes) {
          this._publisherMap.delete(identifier);
        }

        if (!this.hasPublishers) {
          this.exit();
        }
      } catch (err) {
        const msg = error(err, ActionKind.EXIT_SUBSCRIBER, 'Broker');
        client.send(msg);
        client.close();
      }
    });
  }
  private async _removePublisher(
    context: BaseContext,
    client: WebSocket,
  ): Promise<void> {
    const { name, ip } = context ?? {};
    const identifier = getIdentifier({
      name,
      ip,
    });
    const publisher = this._publisherMap.get(identifier);
    if (!publisher) {
      fileLog(
        `[${ActionKind.EXIT_PUBLISHER}]: ${identifier}} has not been added, this action will be ingored`,
        'Broker',
        'warn',
      );
      return;
    }
    try {
      const { subscribers } = publisher;
      subscribers.forEach((subscriber, subscriberIdentifier) => {
        this._addTmpSubScriberRelation(
          {
            name: subscriberIdentifier,
            client: subscriber,
          },
          { name: publisher.name, ip: publisher.ip },
        );
        fileLog(
          // eslint-disable-next-line max-len
          `[${ActionKind.EXIT_PUBLISHER}]: ${identifier} is removing , subscriber: ${subscriberIdentifier} will be add  tmpSubScriberRelation`,
          'Broker',
          'info',
        );
      });
      this._publisherMap.delete(identifier);
      fileLog(
        `[${ActionKind.EXIT_PUBLISHER}]: ${identifier} is removed `,
        'Broker',
        'info',
      );
      if (!this.hasPublishers) {
        fileLog(
          `[${ActionKind.EXIT_PUBLISHER}]: _publisherMap is empty, all server will exit `,
          'Broker',
          'warn',
        );
        this.exit();
      }
    } catch (err) {
      const msg = error(err, ActionKind.EXIT_PUBLISHER, 'Broker');
      client.send(msg);
      client.close();
    }
  }

  private async _addWebClient(
    context: AddWebClientActionPayload,
    client: WebSocket,
  ): Promise<void> {
    const { name } = context ?? {};
    const identifier = getIdentifier({
      name,
    });
    if (this._webClientMap.has(identifier)) {
      fileLog(
        `${identifier}} has been added, this action will override prev WebClient`,
        'Broker',
        'warn',
      );
    }

    try {
      this._webClientMap.set(identifier, client);
      fileLog(`${identifier} adding WebClient Succeed`, 'Broker', 'info');
    } catch (err) {
      const msg = error(err, ActionKind.ADD_WEB_CLIENT, 'Broker');
      client.send(msg);
      client.close();
    }
  }

  private async _notifyWebClient(
    context: NotifyWebClientActionPayload,
    client: WebSocket,
  ): Promise<void> {
    const { name, updateMode } = context ?? {};
    const identifier = getIdentifier({
      name,
    });
    const webClient = this._webClientMap.get(identifier);
    if (!webClient) {
      fileLog(
        `[${ActionKind.NOTIFY_WEB_CLIENT}] ${identifier} has not been added, this action will be ignored`,
        'Broker',
        'warn',
      );
      return;
    }

    try {
      const api = new ReloadWebClientAPI({ name, updateMode });
      webClient.send(JSON.stringify(api));
      fileLog(
        `[${ActionKind.NOTIFY_WEB_CLIENT}] Notify ${name} WebClient Succeed`,
        'Broker',
        'info',
      );
    } catch (err) {
      const msg = error(err, ActionKind.NOTIFY_WEB_CLIENT, 'Broker');
      client.send(msg);
      client.close();
    }
  }

  // app1 consumes provider1, and provider1 not launch. this._tmpSubscriberShelter at this time: {provider1: Map{subscribers: Map{app1: app1+ip+client'}, timestamp: 'xx'} }
  private _addTmpSubScriberRelation(
    subscriber: TmpSubscriberShelterSubscriber,
    publisher: IPublisher,
  ): void {
    const publisherIdentifier = getIdentifier({
      name: publisher.name,
      ip: publisher.ip,
    });
    const subscriberIdentifier = subscriber.name;
    const shelter = this._tmpSubscriberShelter.get(publisherIdentifier);

    if (!shelter) {
      const map = new Map();
      map.set(subscriberIdentifier, subscriber);
      this._tmpSubscriberShelter.set(publisherIdentifier, {
        subscribers: map,
        timestamp: Date.now(),
      });
      fileLog(
        `[AddTmpSubscriberRelation] ${publisherIdentifier}'s subscriber has ${subscriberIdentifier} `,
        'Broker',
        'info',
      );
      return;
    }
    const tmpSubScriberShelterSubscriber =
      shelter.subscribers.get(subscriberIdentifier);
    if (tmpSubScriberShelterSubscriber) {
      fileLog(
        `[AddTmpSubscriberRelation] ${publisherIdentifier} and ${subscriberIdentifier} relation has been added`,
        'Broker',
        'warn',
      );
      shelter.subscribers.set(subscriberIdentifier, subscriber);
      shelter.timestamp = Date.now();
    } else {
      fileLog(
        // eslint-disable-next-line max-len
        `AddTmpSubscriberLog ${publisherIdentifier}'s shelter has been added, update shelter.subscribers ${subscriberIdentifier}`,
        'Broker',
        'warn',
      );
      shelter.subscribers.set(subscriberIdentifier, subscriber);
    }
  }

  private _getTmpSubScribers(
    publisherIdentifier: string,
  ): TmpSubscriberShelterSubscribers | undefined {
    return this._tmpSubscriberShelter.get(publisherIdentifier)?.subscribers;
  }

  // after adding publisher, it will change the temp subscriber to regular subscriber
  private _consumeTmpSubScribers(
    publisher: Publisher, // sub3
    tmpSubScribers: TmpSubscriberShelterSubscribers, // sub4
  ): void {
    tmpSubScribers.forEach((tmpSubScriber, identifier) => {
      fileLog(
        `notifyTmpSubScribers ${publisher.name} will be add a subscriber: ${identifier} `,
        'Broker',
        'warn',
      );
      publisher.addSubscriber(identifier, tmpSubScriber.client);
      publisher.notifySubscriber(identifier, {
        updateKind: UpdateKind.UPDATE_TYPE,
        updateMode: UpdateMode.PASSIVE,
        updateSourcePaths: [publisher.name],
        remoteTypeTarPath: publisher.remoteTypeTarPath,
        name: publisher.name,
      });
    });
  }

  private _clearTmpSubScriberRelation(identifier: string): void {
    this._tmpSubscriberShelter.delete(identifier);
  }

  private _clearTmpSubScriberRelations(): void {
    this._tmpSubscriberShelter.clear();
  }

  private _disconnect(): void {
    this._publisherMap.forEach((publisher) => {
      publisher.close();
    });
  }

  // Every day on 0/6/9/12/15//18, Publishers that have not been connected within 1.5 hours will be cleared regularly.
  // If process.env.FEDERATION_SERVER_TEST is set, it will be read at a specified time.
  private _setSchedule(): void {
    const rule = new schedule.RecurrenceRule();
    if (Number(process.env['FEDERATION_SERVER_TEST'])) {
      const interval = Number(process.env['FEDERATION_SERVER_TEST']) / 1000;
      const second = [];
      for (let i = 0; i < 60; i = i + interval) {
        second.push(i);
      }
      rule.second = second;
    } else {
      rule.second = 0;
      rule.hour = [0, 3, 6, 9, 12, 15, 18];
      rule.minute = 0;
    }
    const serverTest = Number(process.env['FEDERATION_SERVER_TEST']);
    this._scheduleJob = schedule.scheduleJob(rule, () => {
      this._tmpSubscriberShelter.forEach((tmpSubscriber, identifier) => {
        fileLog(
          ` _clearTmpSubScriberRelation ${identifier},  ${
            Date.now() - tmpSubscriber.timestamp >=
            (process.env['GARFISH_MODULE_SERVER_TEST']
              ? serverTest
              : Broker.DEFAULT_WAITING_TIME)
          }`,
          'Broker',
          'info',
        );
        if (
          Date.now() - tmpSubscriber.timestamp >=
          (process.env['FEDERATION_SERVER_TEST']
            ? serverTest
            : Broker.DEFAULT_WAITING_TIME)
        ) {
          this._clearTmpSubScriberRelation(identifier);
        }
      });
    });
  }

  private _clearSchedule(): void {
    if (!this._scheduleJob) {
      return;
    }
    this._scheduleJob.cancel();
    this._scheduleJob = null;
  }

  private _stopWhenSIGTERMOrSIGINT(): void {
    process.on('SIGTERM', () => {
      this.exit();
    });

    process.on('SIGINT', () => {
      this.exit();
    });
  }

  private _handleUnexpectedExit(): void {
    process.on('unhandledRejection', (error) => {
      console.error('Unhandled Rejection Error: ', error);
      fileLog(`Unhandled Rejection Error: ${error}`, 'Broker', 'fatal');
      process.exit(1);
    });
    process.on('uncaughtException', (error) => {
      console.error('Unhandled Exception Error: ', error);
      fileLog(`Unhandled Rejection Error: ${error}`, 'Broker', 'fatal');
      process.exit(1);
    });
  }

  async start(): Promise<void> {
    // noop
  }

  exit(): void {
    const brokerExitLog = new BrokerExitLog();
    this.broadcast(JSON.stringify(brokerExitLog));
    this._disconnect();
    this._clearSchedule();
    this._clearTmpSubScriberRelations();
    this._webSocketServer && this._webSocketServer.close();
    this._secureWebSocketServer && this._secureWebSocketServer.close();

    process.exit(0);
  }

  broadcast(message: unknown): void {
    fileLog(
      `[broadcast] exit info : ${JSON.stringify(message)}`,
      'Broker',
      'warn',
    );
    this._webSocketServer?.clients.forEach((client) => {
      client.send(JSON.stringify(message));
    });

    this._secureWebSocketServer?.clients.forEach((client) => {
      client.send(JSON.stringify(message));
    });
  }
}
