import { BaseContext, Publisher } from '../../types';
import { Action, ActionKind } from './Action';

export interface AddSubscriberActionPayload extends BaseContext {
  publishers: Publisher[];
}

export class AddSubscriberAction extends Action<AddSubscriberActionPayload> {
  constructor(payload: AddSubscriberActionPayload) {
    const { name, publishers, ip } = payload;
    super(
      {
        payload: {
          name,
          publishers,
          ip,
        },
      },
      ActionKind.ADD_SUBSCRIBER,
    );
  }
}
