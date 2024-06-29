import WebSocket from 'ws';
import {
  FetchTypesAPI,
  FetchTypesAPIPayload,
  UpdateSubscriberAPI,
  UpdateSubscriberAPIPayload,
} from './message/API';
import { getIdentifier, fileLog } from './utils';
import { FetchTypesPayload } from './message/Action';
import { RemoteInfo } from '../core/interfaces/HostOptions';

interface PublisherContext {
  name: string;
  ip: string;
  remoteTypeTarPath: string;
  ws: WebSocket;
}

export class Publisher {
  private _ip: string;
  private _name: string;
  private _remoteTypeTarPath: string;
  private _subscribers: Map<string, WebSocket>;
  private _ws: WebSocket;
  dynamicRemoteMap: Map<string, RemoteInfo>;

  constructor(ctx: PublisherContext) {
    this._name = ctx.name;
    this._ip = ctx.ip;
    this._remoteTypeTarPath = ctx.remoteTypeTarPath;
    this._subscribers = new Map();
    this._ws = ctx.ws;
    this.dynamicRemoteMap = new Map();
  }

  get identifier(): string {
    return getIdentifier({
      name: this._name,
      ip: this._ip,
    });
  }

  get name(): string {
    return this._name;
  }

  get ip(): string {
    return this._ip;
  }

  get remoteTypeTarPath(): string {
    return this._remoteTypeTarPath;
  }

  get hasSubscribes(): boolean {
    return Boolean(this._subscribers.size);
  }

  get subscribers(): Map<string, WebSocket> {
    return this._subscribers;
  }
  addSubscriber(identifier: string, subscriber: WebSocket): void {
    fileLog(`${this.name} set subscriber: ${identifier}`, 'Publisher', 'info');
    // this.name sub3, identifier sub4, subscriber client
    this._subscribers.set(identifier, subscriber);
  }

  removeSubscriber(identifier: string): void {
    if (this._subscribers.has(identifier)) {
      fileLog(
        `${this.name} removeSubscriber: ${identifier}`,
        'Publisher',
        'warn',
      );
      this._subscribers.delete(identifier);
    }
  }

  notifySubscriber(
    subscriberIdentifier: string,
    options: UpdateSubscriberAPIPayload,
  ): void {
    const subscriber = this._subscribers.get(subscriberIdentifier);
    if (!subscriber) {
      fileLog(
        `[notifySubscriber] ${this.name} notifySubscriber: ${subscriberIdentifier}, does not exits`,
        'Publisher',
        'error',
      );
      return;
    }

    const api = new UpdateSubscriberAPI(options);
    subscriber.send(JSON.stringify(api));
    fileLog(
      `[notifySubscriber] ${this.name} notifySubscriber: ${JSON.stringify(
        subscriberIdentifier,
      )}, message: ${JSON.stringify(api)}`,
      'Publisher',
      'info',
    );
  }

  fetchRemoteTypes(options: FetchTypesAPIPayload) {
    fileLog(
      `[fetchRemoteTypes] ${
        this.name
      } fetchRemoteTypes, options: ${JSON.stringify(options)}, ws: ${Boolean(
        this._ws,
      )}`,
      'Publisher',
      'info',
    );
    if (!this._ws) {
      return;
    }
    const api = new FetchTypesAPI(options);
    this._ws.send(JSON.stringify(api));
  }

  notifySubscribers(options: UpdateSubscriberAPIPayload): void {
    const api = new UpdateSubscriberAPI(options);
    this.broadcast(api);
  }

  broadcast(message: unknown): void {
    if (this.hasSubscribes) {
      this._subscribers.forEach((subscriber, key) => {
        fileLog(
          `[BroadCast] ${this.name} notifySubscriber: ${key}, PID: ${
            process.pid
          }, message: ${JSON.stringify(message)}`,
          'Publisher',
          'info',
        );
        subscriber.send(JSON.stringify(message));
      });
    } else {
      fileLog(
        `[BroadCast] ${this.name}'s subscribe is empty`,
        'Publisher',
        'warn',
      );
    }
  }

  close(): void {
    this._ws = undefined;
    this._subscribers.forEach((_subscriber, identifier) => {
      fileLog(
        `[BroadCast] close ${this.name} remove: ${identifier}`,
        'Publisher',
        'warn',
      );
      this.removeSubscriber(identifier);
    });
  }
}
