import { createLogger } from '@module-federation/sdk';
import * as fs from 'fs';
import * as path from 'path';
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
  const logDir = '.mf';
  const logFile = path.join(logDir, 'typesGenerate.log');

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const stream = fs.createWriteStream(logFile, { flags: 'a' });
  const timestamp = new Date().toISOString();
  stream.write(`[${timestamp}] [${level.toUpperCase()}] ${module} - ${msg}\n`);
  stream.end();
}

function error(error: unknown, action: ActionKind, from: string): string {
  const err = error instanceof Error ? error : new Error(`${action} error`);
  fileLog(`[${action}] error: ${err}`, from, 'fatal');
  return err.toString();
}

export { log, fileLog, error, logger };
