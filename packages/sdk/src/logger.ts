import { isDebugMode } from './env';

const PREFIX = '[ Module Federation ]';

type LogMethod = 'log' | 'info' | 'warn' | 'error' | 'debug';

type LoggerDelegate = Partial<Record<LogMethod, (...args: any[]) => void>> & {
  [key: string]: ((...args: any[]) => void) | undefined;
};

const DEFAULT_DELEGATE: LoggerDelegate = console as unknown as LoggerDelegate;

class Logger {
  prefix: string;
  private delegate: LoggerDelegate;

  constructor(prefix: string, delegate: LoggerDelegate = DEFAULT_DELEGATE) {
    this.prefix = prefix;
    this.delegate = delegate ?? DEFAULT_DELEGATE;
  }

  setPrefix(prefix: string) {
    this.prefix = prefix;
  }

  setDelegate(delegate?: LoggerDelegate) {
    this.delegate = delegate ?? DEFAULT_DELEGATE;
  }

  private emit(method: LogMethod, args: any[]) {
    const delegate = this.delegate;
    const order: LogMethod[] = (() => {
      switch (method) {
        case 'log':
          return ['log', 'info'];
        case 'info':
          return ['info', 'log'];
        case 'warn':
          return ['warn', 'info', 'log'];
        case 'error':
          return ['error', 'warn', 'log'];
        case 'debug':
        default:
          return ['debug', 'log'];
      }
    })();

    for (const candidate of order) {
      const handler = delegate[candidate];
      if (typeof handler === 'function') {
        handler.call(delegate, this.prefix, ...args);
        return;
      }
    }

    for (const candidate of order) {
      const handler = DEFAULT_DELEGATE[candidate];
      if (typeof handler === 'function') {
        handler.call(DEFAULT_DELEGATE, this.prefix, ...args);
        return;
      }
    }
  }

  log(...args: any[]) {
    this.emit('log', args);
  }
  warn(...args: any[]) {
    this.emit('warn', args);
  }
  error(...args: any[]) {
    this.emit('error', args);
  }

  success(...args: any[]) {
    this.emit('info', args);
  }
  info(...args: any[]) {
    this.emit('info', args);
  }
  ready(...args: any[]) {
    this.emit('info', args);
  }

  debug(...args: any[]) {
    if (isDebugMode()) {
      this.emit('debug', args);
    }
  }
}

function createLogger(prefix: string) {
  return new Logger(prefix);
}

type InfrastructureLogger = Logger & {
  __mf_infrastructure_logger__: true;
};

function createInfrastructureLogger(prefix: string): InfrastructureLogger {
  const infrastructureLogger = new Logger(prefix) as InfrastructureLogger;
  Object.defineProperty(infrastructureLogger, '__mf_infrastructure_logger__', {
    value: true,
    enumerable: false,
    configurable: false,
  });
  return infrastructureLogger;
}

type InfrastructureLoggerCapableCompiler = {
  getInfrastructureLogger?: (name: string) => unknown;
};

function bindLoggerToCompiler(
  loggerInstance: Logger,
  compiler: InfrastructureLoggerCapableCompiler,
  name: string,
) {
  if (
    !(loggerInstance as Partial<InfrastructureLogger>)
      .__mf_infrastructure_logger__
  ) {
    return;
  }
  if (!compiler?.getInfrastructureLogger) {
    return;
  }
  try {
    const infrastructureLogger = compiler.getInfrastructureLogger(name);
    if (
      infrastructureLogger &&
      typeof infrastructureLogger === 'object' &&
      (typeof (infrastructureLogger as LoggerDelegate).log === 'function' ||
        typeof (infrastructureLogger as LoggerDelegate).info === 'function' ||
        typeof (infrastructureLogger as LoggerDelegate).warn === 'function' ||
        typeof (infrastructureLogger as LoggerDelegate).error === 'function')
    ) {
      loggerInstance.setDelegate(
        infrastructureLogger as unknown as LoggerDelegate,
      );
    }
  } catch {
    // If the bundler throws (older versions), fall back to default console logger.
    loggerInstance.setDelegate(undefined);
  }
}

const logger = createLogger(PREFIX);
const infrastructureLogger = createInfrastructureLogger(PREFIX);

export {
  logger,
  infrastructureLogger,
  createLogger,
  createInfrastructureLogger,
  bindLoggerToCompiler,
};
export type { Logger, InfrastructureLogger };
