import { styleText } from 'node:util';
import {
  createInfrastructureLogger,
  createLogger,
} from '@module-federation/sdk';
import { PLUGIN_IDENTIFIER } from './constants';

const createBundlerLogger: typeof createLogger =
  typeof createInfrastructureLogger === 'function'
    ? (createInfrastructureLogger as unknown as typeof createLogger)
    : createLogger;

const logger = createBundlerLogger(
  styleText('cyan', `[ ${PLUGIN_IDENTIFIER} ]`),
);

export default logger;
