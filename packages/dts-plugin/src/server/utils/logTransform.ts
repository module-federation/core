import { styleText } from 'node:util';
import { BrokerExitLog, PublisherRegisteredLog, LogKind } from '../message/Log';

function transformBrokerExitLog(log: BrokerExitLog): string {
  return `${styleText(['bold', 'cyan'], '[ Broker Exit ]')}\n  ${styleText(['bold', 'gray'], 'LEVEL')} ${styleText(['bold', 'white'], log.level)}`;
}

function transformPublisherRegisteredLog(log: PublisherRegisteredLog): string {
  return `${styleText(['bold', 'cyan'], '[ Publisher Registered ]')} ${styleText(['bold', 'gray'], 'LEVEL')} ${styleText(['bold', 'white'], log.level)}`;
}

export type Log = BrokerExitLog | PublisherRegisteredLog;

export function transformLog(log: Log): string {
  switch (log.kind) {
    case LogKind.BrokerExitLog:
      return transformBrokerExitLog(log);
    case LogKind.PublisherRegisteredLog:
      return transformPublisherRegisteredLog(log as PublisherRegisteredLog);
    default:
      return log as unknown as string;
  }
}
