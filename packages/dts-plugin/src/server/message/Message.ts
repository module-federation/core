import { LogKind } from '../message/Log';
import { APIKind } from '../message/API';
import { ActionKind } from '../message/Action';

export type MessageType = 'Log' | 'API' | 'Action';

export class Message {
  type: MessageType;
  kind: APIKind | LogKind | ActionKind;
  time: number;

  constructor(type: MessageType, kind: APIKind | LogKind | ActionKind) {
    this.type = type;
    this.kind = kind;
    this.time = Date.now();
  }
}
