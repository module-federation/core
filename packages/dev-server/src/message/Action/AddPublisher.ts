import { BaseContext } from '../../types';
import { Action, ActionKind } from './Action';

export interface AddPublisherActionPayload extends BaseContext {
  remoteTypeTarPath: string;
}

export class AddPublisherAction extends Action<AddPublisherActionPayload> {
  constructor(payload: AddPublisherActionPayload) {
    super(
      {
        payload,
      },
      ActionKind.ADD_PUBLISHER,
    );
  }
}
