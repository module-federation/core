import { UpdateMode } from '@module-federation/native-federation-typescript/helpers';
import { BaseContext } from '../../types';
import { Action, ActionKind } from './Action';

export interface NotifyWebClientActionPayload extends Omit<BaseContext, 'ip'> {
  updateMode: UpdateMode;
}
export class NotifyWebClientAction extends Action<NotifyWebClientActionPayload> {
  constructor(payload: NotifyWebClientActionPayload) {
    super(
      {
        payload,
      },
      ActionKind.NOTIFY_WEB_CLIENT,
    );
  }
}
