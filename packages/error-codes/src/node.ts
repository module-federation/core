import fs from 'fs';
import path from 'path';
import { getShortErrorMsg } from './getShortErrorMsg';
import type { MFContext } from './MFContext';

function reportDiagnostic(
  code: string,
  message: string,
  args: Record<string, unknown>,
  context?: Partial<MFContext>,
): void {
  try {
    const dir = path.resolve(process.cwd(), '.mf', 'diagnostics');
    fs.mkdirSync(dir, { recursive: true });
    const output: MFContext = {
      ...context,
      latestErrorEvent: { code, message, args, timestamp: Date.now() },
    };
    fs.writeFileSync(
      path.join(dir, 'latest.json'),
      JSON.stringify(output, null, 2),
    );
  } catch {
    // noop - don't let diagnostic writing fail the build
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
  reportDiagnostic(code, msg, args, context);
  return logger(msg) as ReturnType<T>;
}
