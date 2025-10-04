import chalk from 'chalk';
import {
  createInfrastructureLogger,
  createLogger,
} from '@module-federation/sdk';
import { PLUGIN_IDENTIFIER } from './constants';

const createBundlerLogger: typeof createLogger =
  typeof createInfrastructureLogger === 'function'
    ? (createInfrastructureLogger as unknown as typeof createLogger)
    : createLogger;

const logger = createBundlerLogger(chalk.cyan(`[ ${PLUGIN_IDENTIFIER} ]`));

export default logger;
