import { Message } from '../Message';

interface APIContent<T = unknown> {
  code: number;
  payload: T;
}

export const enum APIKind {
  UPDATE_SUBSCRIBER = 'UPDATE_SUBSCRIBER',
  RELOAD_WEB_CLIENT = 'RELOAD_WEB_CLIENT',
  FETCH_TYPES = 'FETCH_TYPES',
}

export class API<T = unknown> extends Message {
  code: number;
  payload: T;

  constructor(content: APIContent<T>, kind: APIKind) {
    super('API', kind);
    const { code, payload } = content;
    this.code = code;
    this.payload = payload;
  }
}
