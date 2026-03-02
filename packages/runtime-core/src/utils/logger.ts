import { createLogger } from '@module-federation/sdk';
import type { MFContext } from '@module-federation/error-codes';
import { logAndReport } from '@module-federation/error-codes/browser';

const LOG_CATEGORY = '[ Federation Runtime ]';
// FIXME: pre-bundle ?
const logger = createLogger(LOG_CATEGORY);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function assert(condition: any, msg: string): asserts condition;
export function assert(
  condition: any,
  code: string,
  descMap: Record<string, string>,
  args?: Record<string, unknown>,
  context?: Partial<MFContext>,
): asserts condition;
export function assert(
  condition: any,
  msgOrCode: string,
  descMap?: Record<string, string>,
  args?: Record<string, unknown>,
  context?: Partial<MFContext>,
): asserts condition {
  if (!condition) {
    if (descMap !== undefined) {
      error(msgOrCode, descMap, args, undefined, context);
    } else {
      error(msgOrCode);
    }
  }
}

export function error(msg: string | Error | unknown): never;
export function error(
  code: string,
  descMap: Record<string, string>,
  args?: Record<string, unknown>,
  originalErrorMsg?: string,
  context?: Partial<MFContext>,
): never;
export function error(
  msgOrCode: string | Error | unknown,
  descMap?: Record<string, string>,
  args?: Record<string, unknown>,
  originalErrorMsg?: string,
  context?: Partial<MFContext>,
): never {
  if (descMap !== undefined) {
    return logAndReport(
      msgOrCode as string,
      descMap,
      args ?? {},
      (msg) => {
        throw new Error(`${LOG_CATEGORY}: ${msg}`);
      },
      originalErrorMsg,
      context,
    );
  }
  const msg = msgOrCode;
  if (msg instanceof Error) {
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

export { logger };
