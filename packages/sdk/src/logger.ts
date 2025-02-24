import { isDebugMode } from './env';

const PREFIX = '[ Module Federation ]';

class Logger {
  prefix: string;
  constructor(prefix: string) {
    this.prefix = prefix;
  }
  log(...args: any[]) {
    console.log(this.prefix, ...args);
  }
  warn(...args: any[]) {
    console.log(this.prefix, ...args);
  }
  error(...args: any[]) {
    console.log(this.prefix, ...args);
  }

  success(...args: any[]) {
    console.log(this.prefix, ...args);
  }
  info(...args: any[]) {
    console.log(this.prefix, ...args);
  }
  ready(...args: any[]) {
    console.log(this.prefix, ...args);
  }

  debug(...args: any[]) {
    if (isDebugMode()) {
      console.log(this.prefix, ...args);
    }
  }
}

function createLogger(prefix: string) {
  return new Logger(prefix);
}

const logger = createLogger(PREFIX);

export { logger, createLogger };
export type { Logger };
