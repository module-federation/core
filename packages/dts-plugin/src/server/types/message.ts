import { ActionKind } from '../message/Action';

export interface BaseContext {
  name: string;
  ip: string;
}

export interface ConnectionAuthQuery {
  WEB_SOCKET_CONNECT_MAGIC_ID: string;
}

export interface Action<T = unknown> {
  kind: ActionKind;
  payload: T;
}

export interface Subscriber {
  name: string;
  ip: string;
}

export type Publisher = Subscriber;
