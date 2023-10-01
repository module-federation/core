import type { Compilation } from 'webpack';

export type LoggerInstance = Compilation['logger'] | Console;

export class Logger {
  private static loggerInstance: LoggerInstance = console;

  static get logger(): LoggerInstance {
    return this.loggerInstance;
  }

  static set logger(logger: Compilation['logger']) {
    // todo: consumer should be able to disable logging
    this.loggerInstance = logger || console;
  }
}
