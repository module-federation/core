/* eslint-disable @typescript-eslint/no-explicit-any */
//@ts-ignore
import npmlog from 'npmlog';

const levels = npmlog.levels;

npmlog.addLevel(
  'error',
  levels.error,
  { fg: 'brightWhite', bg: 'red' },
  ' ERR! ',
);
npmlog.addLevel(
  'warn',
  levels.info,
  { fg: 'brightWhite', bg: 'yellow' },
  ' WARN ',
);
npmlog.addLevel(
  'info',
  levels.warn,
  { fg: 'brightWhite', bg: 'green' },
  ' INFO ',
);
npmlog.addLevel(
  'notice',
  levels.notice,
  { fg: 'black', bg: 'brightYellow' },
  ' NOTE ',
);
npmlog.addLevel(
  'verbose',
  levels.verbose,
  { fg: 'brightWhite', bg: 'brightBlue' },
  ' VRB! ',
);
npmlog.addLevel('silly', levels.silly, { fg: 'black', bg: 'white' }, ' DBG! ');

interface Logger {
  error: (msg: string) => void;
  warn: (msg: string) => void;
  notice: (msg: string) => void;
  info: (msg: string) => void;
  verbose: (msg: string) => void;
  debug: (msg: string) => void;
}

export const logger: Logger = {
  error: (msg: string) => npmlog.error('', msg),
  warn: (msg: string) => npmlog.warn('', msg),
  notice: (msg: string) => npmlog.notice('', msg),
  info: (msg: string) => npmlog.info('', msg),
  verbose: (msg: string) => npmlog.verbose('', msg),
  debug: (msg: string) => npmlog.silly('', msg),
};

export const setLogLevel = (level: string): void => {
  npmlog.level = level === 'debug' ? 'silly' : level;
};

setLogLevel('info');
