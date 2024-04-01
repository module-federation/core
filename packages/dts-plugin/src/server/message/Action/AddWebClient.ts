import { BaseContext } from '../../types';
import { Action, ActionKind } from './Action';

export type AddWebClientActionPayload = Omit<BaseContext, 'ip'>;

export class AddWebClientAction extends Action<AddWebClientActionPayload> {
  constructor(payload: AddWebClientActionPayload) {
    super(
      {
        payload,
      },
      ActionKind.ADD_WEB_CLIENT,
    );
  }
}
