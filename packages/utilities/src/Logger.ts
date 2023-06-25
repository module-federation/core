import { Compilation } from 'webpack';

export type LoggerInstance = Compilation['logger'] | Console;

export class Logger {
  private static loggerInstance: LoggerInstance = console;

  static getLogger(): LoggerInstance {
    return this.loggerInstance;
  }

  static setLogger(logger: Compilation['logger']): LoggerInstance {
    this.loggerInstance = logger || console;
    return logger;
  }

  static getInlineLogger(): (items: unknown[]) =>string{
      return (...items: unknown[]) =>  `if (global.logger) {
        debugger;
        global.logger.log({ data: { items:[${items.map(item => item,).join(',')}], global, __webpack_require__ } });
      } else {
        console.log(${items.join(',')});
      }`;
}}
