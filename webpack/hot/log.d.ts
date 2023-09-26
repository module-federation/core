declare function _exports(level: LogLevel, msg: string | Error): void;
declare namespace _exports {
  function group(level: LogLevel, msg?: string): void;
  function groupCollapsed(level: LogLevel, msg?: string): void;
  function groupEnd(level: LogLevel, msg?: string): void;
  function setLogLevel(level: LogLevel): void;
  function formatError(err: Error): string;
  export { LogLevel };
}
export = _exports;
export type LogLevel = 'info' | 'warning' | 'error';
