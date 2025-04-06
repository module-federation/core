import { createLogger } from '@module-federation/sdk';

const LOG_CATEGORY = '[ Federation Runtime ]';
// FIXME: pre-bundle ?
const logger = createLogger(LOG_CATEGORY);

// Shared function to prefix log messages (from Candidates 27, 40, 72, 73, 74, 76, 78)
function prefixLogMessage(msg: string | Error | unknown): string | Error {
  if (msg instanceof Error) {
    // Modify the existing error message
    msg.message = `${LOG_CATEGORY}: ${msg.message}`;
    return msg;
  } else {
    return `${LOG_CATEGORY}: ${msg}`;
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function assert(condition: any, msg: string): asserts condition {
  if (!condition) {
    error(msg);
  }
}

export function error(msg: string | Error | unknown): never {
  const prefixedMsg = prefixLogMessage(msg);
  if (prefixedMsg instanceof Error) {
    throw prefixedMsg;
  }
  throw new Error(prefixedMsg);
  // if (msg instanceof Error) {
  //   msg.message = `${LOG_CATEGORY}: ${msg.message}`;
  //   throw msg;
  // }
  // throw new Error(`${LOG_CATEGORY}: ${msg}`);
}

export function warn(msg: Parameters<typeof console.warn>[0]): void {
  const prefixedMsg = prefixLogMessage(msg);
  logger.warn(prefixedMsg);
  // if (msg instanceof Error) {
  //   msg.message = `${LOG_CATEGORY}: ${msg.message}`;
  //   logger.warn(msg);
  // } else {
  //   logger.warn(msg);
  // }
}

export function log(...args: unknown[]) {
  logger.log(...args);
}

export { logger };
