import { Message } from '../../message/Message';

interface ActionContent<T = unknown> {
  payload: T;
}

// Publisher/Subscriber will send ActionKind message to communicate with Broker
export const enum ActionKind {
  ADD_SUBSCRIBER = 'ADD_SUBSCRIBER',
  EXIT_SUBSCRIBER = 'EXIT_SUBSCRIBER',
  ADD_PUBLISHER = 'ADD_PUBLISHER',
  UPDATE_PUBLISHER = 'UPDATE_PUBLISHER',
  NOTIFY_SUBSCRIBER = 'NOTIFY_SUBSCRIBER',
  EXIT_PUBLISHER = 'EXIT_PUBLISHER',
  ADD_WEB_CLIENT = 'ADD_WEB_CLIENT',
  NOTIFY_WEB_CLIENT = 'NOTIFY_WEB_CLIENT',
  FETCH_TYPES = 'FETCH_TYPES',
  ADD_DYNAMIC_REMOTE = 'ADD_DYNAMIC_REMOTE',
}

export class Action<T = unknown> extends Message {
  payload: T;

  constructor(content: ActionContent<T>, kind: ActionKind) {
    super('Action', kind);
    const { payload } = content;
    this.payload = payload;
  }
}
