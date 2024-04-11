import { BaseContext, Publisher } from '../../types';
import { Action, ActionKind } from './Action';

export interface ExitSubscriberActionPayload extends BaseContext {
  publishers: Publisher[];
}

export class ExitSubscriberAction extends Action<ExitSubscriberActionPayload> {
  constructor(payload: ExitSubscriberActionPayload) {
    super(
      {
        payload,
      },
      ActionKind.EXIT_SUBSCRIBER,
    );
  }
}
