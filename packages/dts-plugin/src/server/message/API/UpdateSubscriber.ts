import { UpdateMode } from '../../constant';
import { UpdateKind } from '../../message/Action';
import { API, APIKind } from './API';

export interface UpdateSubscriberAPIPayload {
  updateKind: UpdateKind;
  updateMode: UpdateMode;
  updateSourcePaths: string[];
  remoteTypeTarPath: string;
  name: string;
}

export class UpdateSubscriberAPI extends API<UpdateSubscriberAPIPayload> {
  constructor(payload: UpdateSubscriberAPIPayload) {
    super(
      {
        code: 0,
        payload,
      },
      APIKind.UPDATE_SUBSCRIBER,
    );
  }
}
