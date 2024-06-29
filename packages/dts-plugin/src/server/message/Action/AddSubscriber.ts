import { RemoteInfo } from '../../../core/interfaces/HostOptions';
import { BaseContext, Publisher } from '../../types';
import { Action, ActionKind } from './Action';

export interface AddSubscriberActionPayload extends BaseContext {
  publishers: Publisher[];
}

export class AddSubscriberAction extends Action<AddSubscriberActionPayload> {
  constructor(payload: AddSubscriberActionPayload) {
    super(
      {
        payload,
      },
      ActionKind.ADD_SUBSCRIBER,
    );
  }
}
