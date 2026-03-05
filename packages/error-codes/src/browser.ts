import { getShortErrorMsg } from './getShortErrorMsg';
import type { MFContext } from './MFContext';

export function logAndReport<T extends (msg: string) => unknown>(
  code: string,
  descMap: Record<string, string>,
  args: Record<string, unknown>,
  logger: T,
  originalErrorMsg?: string,
  context?: Partial<MFContext>,
): ReturnType<T> {
  const msg = getShortErrorMsg(code, descMap, args, originalErrorMsg);
  return logger(msg) as ReturnType<T>;
}
