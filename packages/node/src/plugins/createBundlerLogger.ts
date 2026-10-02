import {
  createInfrastructureLogger,
  createLogger,
} from '@module-federation/sdk';

export const createBundlerLogger: typeof createLogger =
  typeof createInfrastructureLogger === 'function'
    ? (createInfrastructureLogger as unknown as typeof createLogger)
    : createLogger;
