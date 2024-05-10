import { LogLevels } from 'npmlog';
export declare const logger: {
  error: (msg: any) => void;
  warn: (msg: any) => void;
  notice: (msg: any) => void;
  info: (msg: any) => void;
  verbose: (msg: any) => void;
  debug: (msg: any) => void;
};
export declare const setLogLevel: (level: LogLevels | 'debug') => void;
