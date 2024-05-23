import { UpdateMode } from '../../constant';
import { BaseContext } from '../../types';
import { Action, ActionKind } from './Action';
import { UpdateKind } from './Update';

export interface UpdatePublisherActionPayload extends BaseContext {
  updateKind: UpdateKind;
  updateMode: UpdateMode;
  updateSourcePaths?: string[];
  remoteTypeTarPath: string;
}

export class UpdatePublisherAction extends Action<UpdatePublisherActionPayload> {
  constructor(payload: UpdatePublisherActionPayload) {
    super(
      {
        payload,
      },
      ActionKind.UPDATE_PUBLISHER,
    );
  }
}
