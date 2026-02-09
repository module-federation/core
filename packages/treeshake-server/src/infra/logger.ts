import pino from 'pino';

export const createLogger = (opts?: { level?: string }) =>
  pino({
    level: opts?.level ?? 'info',
    formatters: {
      level(label) {
        return { level: label };
      },
    },
  });

export let logger = createLogger();

export const setLogger = (next: ReturnType<typeof createLogger>) => {
  logger = next;
};
