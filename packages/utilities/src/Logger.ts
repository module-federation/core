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
}
