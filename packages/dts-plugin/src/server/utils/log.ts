import { createLogger } from '@module-federation/sdk';
import * as log4js from 'log4js';
import { MF_SERVER_IDENTIFIER } from '../constant';
import { ActionKind } from '../message/Action';

const logger = createLogger(`[ ${MF_SERVER_IDENTIFIER} ]`);

function log(msg: string): void {
  logger.info(msg);
}

function fileLog(msg: string, module: string, level: string) {
  if (!process?.env?.['FEDERATION_DEBUG']) {
    return;
  }
  log4js.configure({
    appenders: {
      [module]: { type: 'file', filename: '.mf/typesGenerate.log' },
      default: { type: 'file', filename: '.mf/typesGenerate.log' },
    },
    categories: {
      [module]: { appenders: [module], level: 'error' },
      default: { appenders: ['default'], level: 'trace' },
    },
  });

  const logger4 = log4js.getLogger(module);
  logger4.level = 'debug';
  // @ts-ignore
  logger4[level]?.(msg);
}

function error(error: unknown, action: ActionKind, from: string): string {
  const err = error instanceof Error ? error : new Error(`${action} error`);
  fileLog(`[${action}] error: ${err}`, from, 'fatal');
  return err.toString();
}

export { log, fileLog, error, logger };
