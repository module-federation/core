import {
  createInfrastructureLogger,
  createLogger,
} from '@module-federation/sdk';

const createBundlerLogger: typeof createLogger =
  typeof createInfrastructureLogger === 'function'
    ? (createInfrastructureLogger as unknown as typeof createLogger)
    : createLogger;

const logger = createBundlerLogger('[ nextjs-mf ]');

export default logger;
