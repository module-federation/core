import { RemoteInfo } from '../../../core/interfaces/HostOptions';
import { BaseContext } from '../../types';
import { Action, ActionKind } from './Action';

// host consumes provider , the action will notify host fetch provider types
export interface FetchTypesPayload extends BaseContext {
  remoteInfo: RemoteInfo;
}

export class FetchTypesAction extends Action<FetchTypesPayload> {
  constructor(payload: FetchTypesPayload) {
    super(
      {
        payload,
      },
      ActionKind.FETCH_TYPES,
    );
  }
}
