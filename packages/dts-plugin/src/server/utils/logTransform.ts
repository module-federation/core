import chalk from 'chalk';
import { BrokerExitLog, PublisherRegisteredLog, LogKind } from '../message/Log';

function transformBrokerExitLog(log: BrokerExitLog): string {
  return chalk`{bold {cyan [ Broker Exit ]}
  {grey LEVEL} {white ${log.level}}}`;
}

function transformPublisherRegisteredLog(log: PublisherRegisteredLog): string {
  return chalk`{bold {cyan [ Publisher Registered ]} {grey LEVEL} {white ${log.level}}}`;
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
