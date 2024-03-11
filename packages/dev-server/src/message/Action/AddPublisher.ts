import { BaseContext } from '../../types';
import { Action, ActionKind } from './Action';

export interface AddPublisherActionPayload extends BaseContext {
  remoteTypeTarPath: string;
}

export class AddPublisherAction extends Action<AddPublisherActionPayload> {
  constructor(payload: AddPublisherActionPayload) {
    const { name, remoteTypeTarPath, ip } = payload;

    super(
      {
        payload: {
          name,
          ip,
          remoteTypeTarPath,
        },
      },
      ActionKind.ADD_PUBLISHER,
    );
  }
}
