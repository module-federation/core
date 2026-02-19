import { createLogger } from '@module-federation/sdk';
import {
  getShortErrorMsg,
  runtimeDescMap,
} from '@module-federation/error-codes';

const LOG_CATEGORY = '[ Federation Runtime ]';
// FIXME: pre-bundle ?
const logger = createLogger(LOG_CATEGORY);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function assert(condition: any, msg: string): asserts condition {
  if (!condition) {
    error(msg);
  }
}

export function error(msg: string | Error | unknown): never {
  if (msg instanceof Error) {
    // Check if the message already starts with the log category to avoid duplication
    if (!msg.message.startsWith(LOG_CATEGORY)) {
      msg.message = `${LOG_CATEGORY}: ${msg.message}`;
    }
    throw msg;
  }
  throw new Error(`${LOG_CATEGORY}: ${msg}`);
}

export function warn(msg: Parameters<typeof console.warn>[0]): void {
  if (msg instanceof Error) {
    // Check if the message already starts with the log category to avoid duplication
    if (!msg.message.startsWith(LOG_CATEGORY)) {
      msg.message = `${LOG_CATEGORY}: ${msg.message}`;
    }
    logger.warn(msg);
  } else {
    logger.warn(msg);
  }
}

export function log(...args: unknown[]) {
  logger.log(...args);
}

export function runtimeError(
  code: string,
  context: Record<string, any>,
  suffix?: string,
): string {
  return getShortErrorMsg(code, runtimeDescMap, context, suffix);
}

export { logger };
