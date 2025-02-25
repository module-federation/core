import chalk from 'chalk';
import { createLogger } from '@module-federation/sdk';
import { PLUGIN_IDENTIFIER } from './constants';

const logger = createLogger(chalk.cyan(`[ ${PLUGIN_IDENTIFIER} ]`));

export default logger;
