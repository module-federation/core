import { BROWSER_LOG_KEY, BROWSER_LOG_VALUE } from './constant';
import { isBrowserEnv, isDebugMode } from './env';

function safeToString(info: any): string {
  try {
    return JSON.stringify(info, null, 2);
  } catch (e) {
    return '';
  }
}

const DEBUG_LOG = '[ FEDERATION DEBUG ]';

function safeGetLocalStorageItem() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(BROWSER_LOG_KEY) === BROWSER_LOG_VALUE;
    }
  } catch (error) {
    return typeof typeof document !== 'undefined';
  }
  return false;
}
class Logger {
  enable = false;
  identifier: string;
  constructor(identifier?: string) {
    this.identifier = identifier || DEBUG_LOG;
    if (isBrowserEnv() && safeGetLocalStorageItem()) {
      this.enable = true;
    } else if (isDebugMode()) {
      this.enable = true;
    }
  }
  info(msg: string, info?: any): void {
    if (this.enable) {
      const argsToString = safeToString(info) || '';
      if (isBrowserEnv()) {
        console.info(
          `%c ${this.identifier}: ${msg} ${argsToString}`,
          'color:#3300CC',
        );
      } else {
        console.info(
          '\x1b[34m%s',
          `${this.identifier}: ${msg} ${
            argsToString ? `\n${argsToString}` : ''
          }`,
        );
      }
    }
  }
  logOriginalInfo(...args: unknown[]) {
    if (this.enable) {
      if (isBrowserEnv()) {
        console.info(`%c ${this.identifier}: OriginalInfo`, 'color:#3300CC');
        console.log(...args);
      } else {
        console.info(`%c ${this.identifier}: OriginalInfo`, 'color:#3300CC');
        console.log(...args);
      }
    }
  }
}

export { Logger };
