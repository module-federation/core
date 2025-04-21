import { type Logger, createLogger } from '@module-federation/sdk';
import chalk from 'chalk';

export const PREFIX = '[ Module Federation CLI ]';

const logger: Logger = createLogger(chalk`{bold {cyan ${PREFIX}}}`);

export default logger;
