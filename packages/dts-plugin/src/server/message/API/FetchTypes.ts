import { RemoteInfo } from '../../../core/interfaces/HostOptions';
import { API, APIKind } from './API';

export interface FetchTypesAPIPayload {
  remoteInfo: RemoteInfo;
  once?: boolean;
}

export class FetchTypesAPI extends API<FetchTypesAPIPayload> {
  constructor(payload: FetchTypesAPIPayload) {
    super(
      {
        code: 0,
        payload,
      },
      APIKind.FETCH_TYPES,
    );
  }
}
