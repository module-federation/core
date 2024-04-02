import { UpdateMode } from '@module-federation/native-federation-typescript/helpers';
import { API, APIKind } from './API';

export interface ReloadWebClientAPIPayload {
  name: string;
  updateMode: UpdateMode;
}

export class ReloadWebClientAPI extends API<ReloadWebClientAPIPayload> {
  constructor(payload: ReloadWebClientAPIPayload) {
    super(
      {
        code: 0,
        payload,
      },
      APIKind.RELOAD_WEB_CLIENT,
    );
  }
}
