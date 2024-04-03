import { BaseContext } from '../../types';
import { Action, ActionKind } from './Action';

export class ExitPublisherAction extends Action<BaseContext> {
  constructor(payload: BaseContext) {
    super(
      {
        payload,
      },
      ActionKind.EXIT_PUBLISHER,
    );
  }
}
