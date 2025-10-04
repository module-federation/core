import chalk from 'chalk';
import { createInfrastructureLogger } from '@module-federation/sdk';
import { PLUGIN_IDENTIFIER } from './constants';

const logger = createInfrastructureLogger(
  chalk.cyan(`[ ${PLUGIN_IDENTIFIER} ]`),
);

export default logger;
