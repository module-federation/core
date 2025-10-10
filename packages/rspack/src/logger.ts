import {
  createInfrastructureLogger,
  createLogger,
  type Logger,
} from '@module-federation/sdk';

type LoggerFactory = (prefix: string) => Logger;

const isLoggerFactory = (candidate: unknown): candidate is LoggerFactory =>
  typeof candidate === 'function';

const createBundlerLogger: LoggerFactory = isLoggerFactory(
  createInfrastructureLogger,
)
  ? (prefix) => createInfrastructureLogger(prefix)
  : createLogger;

const logger = createBundlerLogger('[ Module Federation Rspack Plugin ]');

export default logger;
