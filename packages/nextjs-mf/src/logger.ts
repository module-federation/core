const PREFIX = '[nextjs-mf]';

function prefix(args: unknown[]): unknown[] {
  return [PREFIX, ...args];
}

const logger = {
  error(...args: unknown[]): void {
    console.error(...prefix(args));
  },
  warn(...args: unknown[]): void {
    console.warn(...prefix(args));
  },
  info(...args: unknown[]): void {
    console.info(...prefix(args));
  },
  debug(...args: unknown[]): void {
    if (process.env['NEXTJS_MF_DEBUG'] === '1') {
      console.debug(...prefix(args));
    }
  },
};

export default logger;
