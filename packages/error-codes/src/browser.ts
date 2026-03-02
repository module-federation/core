import { getShortErrorMsg } from './getShortErrorMsg';
import type { MFContext } from './MFContext';

export interface DiagnosticEntry {
  code: string;
  message: string;
  args?: Record<string, unknown>;
  context?: Partial<MFContext>;
  timestamp: number;
}

function reportDiagnostic(entry: DiagnosticEntry): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mf:diagnostic', { detail: entry }));
  }
}

export function logAndReport<T extends (msg: string) => unknown>(
  code: string,
  descMap: Record<string, string>,
  args: Record<string, unknown>,
  logger: T,
  originalErrorMsg?: string,
  context?: Partial<MFContext>,
): ReturnType<T> {
  const msg = getShortErrorMsg(code, descMap, args, originalErrorMsg);
  reportDiagnostic({
    code,
    message: msg,
    args,
    context,
    timestamp: Date.now(),
  });
  return logger(msg) as ReturnType<T>;
}
