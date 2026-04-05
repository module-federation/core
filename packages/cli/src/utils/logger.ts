import { styleText } from 'node:util';
import { type Logger, createLogger } from '@module-federation/sdk';

export const PREFIX = '[ Module Federation CLI ]';

const logger: Logger = createLogger(styleText(['bold', 'cyan'], PREFIX));

export default logger;
