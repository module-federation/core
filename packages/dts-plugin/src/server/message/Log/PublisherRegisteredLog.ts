import { Log, LogLevel, LogKind } from './Log';
import { ActionKind } from '../../message/Action';

export class PublisherRegisteredLog extends Log {
  actionKind: ActionKind;
  msg: string;

  constructor(actionKind: ActionKind, msg: string) {
    super(LogLevel.LOG, LogKind.PublisherRegisteredLog);
    this.actionKind = actionKind;
    this.msg = msg;
  }
}
