import { type Logger, createLogger as _createLogger } from 'isomorphic-rslog';
import { isDebugMode } from './env';

const PREFIX = '[ Module Federation ]';

function setDebug(loggerInstance: Logger) {
  if (isDebugMode()) {
    loggerInstance.level = 'verbose';
  }
}

function setPrefix(loggerInstance: Logger, prefix: string) {
  loggerInstance.labels = {
    warn: `${prefix} Warn`,
    error: `${prefix} Error`,
    success: `${prefix} Success`,
    info: `${prefix} Info`,
    ready: `${prefix} Ready`,
    debug: `${prefix} Debug`,
  };
}

function createLogger(prefix: string) {
  const loggerInstance = _createLogger({
    labels: {
      warn: `${PREFIX} Warn`,
      error: `${PREFIX} Error`,
      success: `${PREFIX} Success`,
      info: `${PREFIX} Info`,
      ready: `${PREFIX} Ready`,
      debug: `${PREFIX} Debug`,
    },
  });

  setDebug(loggerInstance);
  setPrefix(loggerInstance, prefix);
  return loggerInstance;
}

const logger = createLogger(PREFIX);

export { logger, createLogger };
export type { Logger };
