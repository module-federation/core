import { createLogger } from '@module-federation/sdk';
import { PLUGIN_IDENTIFIER } from './constants';

const logger = createLogger(`[ ${PLUGIN_IDENTIFIER} ]`);

export default logger;
