export type LogTypeEnum = (typeof LogType)[keyof typeof LogType];
export const LogType: Readonly<{
  error: 'error';
  warn: 'warn';
  info: 'info';
  log: 'log';
  debug: 'debug';
  trace: 'trace';
  group: 'group';
  groupCollapsed: 'groupCollapsed';
  groupEnd: 'groupEnd';
  profile: 'profile';
  profileEnd: 'profileEnd';
  time: 'time';
  clear: 'clear';
  status: 'status';
}>;
declare class WebpackLogger {
  /**
   * @param {function(LogTypeEnum, any[]=): void} log log function
   * @param {function(string | function(): string): WebpackLogger} getChildLogger function to create child logger
   */
  constructor(
    log: (arg0: LogTypeEnum, arg1: any[] | undefined) => void,
    getChildLogger: (arg0: string | (() => string)) => WebpackLogger,
  );
  getChildLogger: (arg0: string | (() => string)) => WebpackLogger;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
  log(...args: any[]): void;
  debug(...args: any[]): void;
  assert(assertion: any, ...args: any[]): void;
  trace(): void;
  clear(): void;
  status(...args: any[]): void;
  group(...args: any[]): void;
  groupCollapsed(...args: any[]): void;
  groupEnd(...args: any[]): void;
  profile(label: any): void;
  profileEnd(label: any): void;
  time(label: any): void;
  timeLog(label: any): void;
  timeEnd(label: any): void;
  timeAggregate(label: any): void;
  timeAggregateEnd(label: any): void;
  [LOG_SYMBOL]: (arg0: LogTypeEnum, arg1?: any[] | undefined) => void;
  [TIMERS_SYMBOL]: any;
  [TIMERS_AGGREGATES_SYMBOL]: any;
}
/** @typedef {typeof LogType[keyof typeof LogType]} LogTypeEnum */
declare const LOG_SYMBOL: unique symbol;
declare const TIMERS_SYMBOL: unique symbol;
declare const TIMERS_AGGREGATES_SYMBOL: unique symbol;
export { WebpackLogger as Logger };
