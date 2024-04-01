import { Log, LogLevel, LogKind } from './Log';

export class BrokerExitLog extends Log {
  constructor() {
    super(LogLevel.LOG, LogKind.BrokerExitLog);
  }
}
