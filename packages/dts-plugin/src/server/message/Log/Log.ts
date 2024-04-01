import { MessageType, Message } from '../../message/Message';

export const enum LogLevel {
  LOG = 'LOG',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export const enum LogKind {
  BrokerExitLog = 'BrokerExitLog',
  PublisherRegisteredLog = 'PublisherRegisteredLog',
}

export class Log extends Message {
  level: LogLevel;
  ignoreVerbose = false;

  constructor(level: LogLevel, kind: LogKind, ignoreVerbose = false) {
    super('Log', kind);
    this.level = level;
    this.ignoreVerbose = ignoreVerbose;
  }
}
