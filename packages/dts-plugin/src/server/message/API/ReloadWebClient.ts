import { UpdateMode } from '../../constant';
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
