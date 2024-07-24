import { RemoteInfo } from '../../../core/interfaces/HostOptions';
import { BaseContext } from '../../types';
import { Action, ActionKind } from './Action';

// host consumes provider , the action will notify host fetch provider types
export interface AddDynamicRemotePayload extends BaseContext {
  remoteInfo: RemoteInfo;
  remoteIp: string;
}

export class AddDynamicRemoteAction extends Action<AddDynamicRemotePayload> {
  constructor(payload: AddDynamicRemotePayload) {
    super(
      {
        payload,
      },
      ActionKind.ADD_DYNAMIC_REMOTE,
    );
  }
}
