declare function _exports({
  level,
  debug,
  console,
}: LoggerOptions): (arg0: string, arg1: LogTypeEnum, arg2: any[]) => void;
export = _exports;
export type FilterItemTypes =
  import('../../declarations/WebpackOptions').FilterItemTypes;
export type FilterTypes =
  import('../../declarations/WebpackOptions').FilterTypes;
export type LogTypeEnum = import('./Logger').LogTypeEnum;
export type FilterFunction = (arg0: string) => boolean;
export type LoggerConsole = {
  clear: () => void;
  trace: () => void;
  info: (...args: any[]) => void;
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug?: (...args: any[]) => void;
  group?: (...args: any[]) => void;
  groupCollapsed?: (...args: any[]) => void;
  groupEnd?: (...args: any[]) => void;
  status?: (...args: any[]) => void;
  profile?: (...args: any[]) => void;
  profileEnd?: (...args: any[]) => void;
  logTime?: (...args: any[]) => void;
};
export type LoggerOptions = {
  /**
   * loglevel
   */
  level: false | true | 'none' | 'error' | 'warn' | 'info' | 'log' | 'verbose';
  /**
   * filter for debug logging
   */
  debug: FilterTypes | boolean;
  /**
   * the console to log to
   */
  console: LoggerConsole;
};
