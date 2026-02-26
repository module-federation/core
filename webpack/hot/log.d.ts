declare namespace _exports {
  export { LogLevel };
}
declare function _exports(level: LogLevel, msg: string | Error): void;
declare namespace _exports {
  function formatError(err: Error): string;
  let group: (level: LogLevel, msg?: string) => void;
  let groupCollapsed: (level: LogLevel, msg?: string) => void;
  let groupEnd: (level: LogLevel, msg?: string) => void;
  function setLogLevel(level: LogLevel): void;
}
export = _exports;
type LogLevel = 'info' | 'warning' | 'error';
