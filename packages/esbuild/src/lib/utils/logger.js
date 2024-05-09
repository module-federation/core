/* eslint-disable @typescript-eslint/no-explicit-any */

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

export const logger = {
  error: (msg) => npmlog.error('', msg),
  warn: (msg) => npmlog.warn('', msg),
  notice: (msg) => npmlog.notice('', msg),
  info: (msg) => npmlog.info('', msg),
  verbose: (msg) => npmlog.verbose('', msg),
  debug: (msg) => npmlog.silly('', msg),
};

export const setLogLevel = (level) => {
  npmlog.level = level === 'debug' ? 'silly' : level;
};

setLogLevel('info');
