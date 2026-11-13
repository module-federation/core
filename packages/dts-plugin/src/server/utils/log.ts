import { createLogger } from '@module-federation/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { MF_SERVER_IDENTIFIER } from '../constant';
import { ActionKind } from '../message/Action';

const logger = createLogger(`[ ${MF_SERVER_IDENTIFIER} ]`);

export interface DiagnosticContext {
  outcome?: 'applied' | 'failed';
  consumer?: string;
  remote?: string;
  entry?: string;
  buildVersion?: string;
  operationId?: string;
  trigger?: string;
  stage?: string;
  timingsMs?: Record<string, number>;
}

export interface DiagnosticLog {
  timestamp: string;
  source: string;
  level: string;
  message: string;
  context?: DiagnosticContext;
}

const listeners = new Set<(entry: DiagnosticLog) => void>();

/** The broker subscribes in its own process. Worker logs remain local. */
export function observeFileLogs(listener: (entry: DiagnosticLog) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function log(msg: string): void {
  logger.info(msg);
}

function fileLog(
  msg: string,
  module: string,
  level: string,
  context?: DiagnosticContext,
) {
  const entry: DiagnosticLog = {
    timestamp: new Date().toISOString(),
    source: module,
    level: level.toLowerCase(),
    message: msg,
    ...(context && { context }),
  };
  for (const listener of listeners) {
    try {
      listener(entry);
    } catch {
      // Diagnostics must not interrupt type generation or development updates.
    }
  }
  if (!process?.env?.['FEDERATION_DEBUG']) {
    return;
  }
  try {
    const logDir = '.mf';
    const logFile = path.join(logDir, 'typesGenerate.log');

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(
      logFile,
      `[${entry.timestamp}] [${level.toUpperCase()}] ${module} - ${msg}${
        context ? ` ${JSON.stringify(context)}` : ''
      }\n`,
    );
  } catch {}
}

function error(error: unknown, action: ActionKind, from: string): string {
  const err = error instanceof Error ? error : new Error(`${action} error`);
  fileLog(`[${action}] error: ${err}`, from, 'fatal');
  return err.toString();
}

export { log, fileLog, error, logger };
