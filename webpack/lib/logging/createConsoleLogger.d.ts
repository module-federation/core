declare namespace _exports {
  export {
    FilterItemTypes,
    FilterTypes,
    LogTypeEnum,
    Args,
    FilterFunction,
    LoggingFunction,
    LoggerConsole,
    LoggerOptions,
  };
}
declare function _exports({
  level,
  debug,
  console,
}: LoggerOptions): LoggingFunction;
export = _exports;
type FilterItemTypes =
  import('../../declarations/WebpackOptions').FilterItemTypes;
type FilterTypes = import('../../declarations/WebpackOptions').FilterTypes;
type LogTypeEnum = import('./Logger').LogTypeEnum;
type Args = import('./Logger').Args;
type FilterFunction = (item: string) => boolean;
type LoggingFunction = (value: string, type: LogTypeEnum, args?: Args) => void;
type LoggerConsole = {
  clear: () => void;
  trace: () => void;
  info: (...args: Args) => void;
  log: (...args: Args) => void;
  warn: (...args: Args) => void;
  error: (...args: Args) => void;
  debug?: ((...args: Args) => void) | undefined;
  group?: ((...args: Args) => void) | undefined;
  groupCollapsed?: ((...args: Args) => void) | undefined;
  groupEnd?: ((...args: Args) => void) | undefined;
  status?: ((...args: Args) => void) | undefined;
  profile?: ((...args: Args) => void) | undefined;
  profileEnd?: ((...args: Args) => void) | undefined;
  logTime?: ((...args: Args) => void) | undefined;
};
type LoggerOptions = {
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
