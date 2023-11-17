const LOG_CATEGORY = '[ Federation Runtime ]';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function assert(condition: any, msg: string): asserts condition {
  if (!condition) {
    error(msg);
  }
}

export function error(msg: string | Error | unknown): never {
  throw new Error(`${LOG_CATEGORY}: ${msg}`);
}

export function warn(msg: Parameters<typeof console.warn>[0]): void {
  console.warn(`${LOG_CATEGORY}: ${msg}`);
}
