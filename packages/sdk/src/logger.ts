// Local implementation modified from isomorphic-rslog@0.0.6
// Main changes:
// 1. Remove external dependencies and implement core logging logic directly
// 2. Unified handling for both browser and Node environments
// 3. Simplified color processing while preserving basic label formatting

const isBrowser: boolean =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';

// Define the default prefix (set based on project requirements)
const PREFIX = '[App]';

// Define a type for functions that apply color formatting
type ColorFormatter = (text: string) => string[];

// Define an interface for the set of color formatters
interface Colors {
  red: ColorFormatter;
  green: ColorFormatter;
  orange: ColorFormatter;
  cyan: ColorFormatter;
  magenta: ColorFormatter;
  gray: ColorFormatter;
}

// Create color formatters for both browser and Node environments
const createColorFormatters = (): Colors => {
  if (isBrowser) {
    const supportsColor = (): boolean => {
      try {
        const testEl = document.createElement('div');
        testEl.style.color = 'rgb(0, 0, 0)';
        document.body.appendChild(testEl);
        const color = getComputedStyle(testEl).color;
        document.body.removeChild(testEl);
        return color !== 'rgb(0, 0, 0)';
      } catch (e) {
        return false;
      }
    };

    const colorMap: Record<keyof Colors, string> = {
      red: 'color: #ff0000;',
      green: 'color: #00ff00;',
      orange: 'color: #ffa500;',
      cyan: 'color: #00ffff;',
      magenta: 'color: #ff00ff;',
      gray: 'color: #808080;',
    };

    const result = {} as Colors;
    // biome-ignore lint/complexity/noForEach: <explanation>
    (Object.entries(colorMap) as [keyof Colors, string][]).forEach(
      ([key, style]) => {
        result[key] = (text: string) =>
          supportsColor() ? [`%c${text}`, style] : [text];
      },
    );
    return result;
  }

  // Node environment: define ANSI color codes
  const colorCodes: Record<keyof Colors | 'reset', string> = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    orange: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m',
    reset: '\x1b[0m',
  };

  return {
    red: (text: string) => [`${colorCodes.red}${text}${colorCodes.reset}`],
    green: (text: string) => [`${colorCodes.green}${text}${colorCodes.reset}`],
    orange: (text: string) => [
      `${colorCodes.orange}${text}${colorCodes.reset}`,
    ],
    cyan: (text: string) => [`${colorCodes.cyan}${text}${colorCodes.reset}`],
    magenta: (text: string) => [
      `${colorCodes.magenta}${text}${colorCodes.reset}`,
    ],
    gray: (text: string) => [`${colorCodes.gray}${text}${colorCodes.reset}`],
  };
};

const colors: Colors = createColorFormatters();

// Define the allowed log level names
type LogLevelName = 'error' | 'warn' | 'info' | 'ready' | 'success' | 'debug';

// Define a configuration interface for each log type
interface LogTypeConfig {
  level: number;
  color: ColorFormatter;
  label: string;
}

const LOG_TYPES: Record<LogLevelName, LogTypeConfig> = {
  error: { level: 0, color: colors.red, label: 'Error' },
  warn: { level: 1, color: colors.orange, label: 'Warn' },
  info: { level: 2, color: colors.cyan, label: 'Info' },
  ready: { level: 2, color: colors.green, label: 'Ready' },
  success: { level: 2, color: colors.green, label: 'Success' },
  debug: { level: 3, color: colors.magenta, label: 'Debug' },
};

// Define an interface for the Logger to optimize TypeScript typing
export interface ILogger {
  level: LogLevelName;
  labels: Partial<Record<LogLevelName, string>>;
  error(message: unknown, ...args: unknown[]): void;
  warn(message: unknown, ...args: unknown[]): void;
  info(message: unknown, ...args: unknown[]): void;
  ready(message: unknown, ...args: unknown[]): void;
  success(message: unknown, ...args: unknown[]): void;
  debug(message: unknown, ...args: unknown[]): void;
  setLevel(newLevel: LogLevelName | number): void;
}

// Core Logger implementation
function createLogger(prefix: string): ILogger {
  let currentLevel: number = LOG_TYPES.info.level;
  const labels: Partial<Record<LogLevelName, string>> = {};

  const log = (
    type: LogLevelName,
    message: unknown,
    ...args: unknown[]
  ): void => {
    const config = LOG_TYPES[type];
    if (config.level > currentLevel) return;

    const label = labels[type] || `${prefix} ${config.label}`;
    const [formattedLabel] = config.color(label);

    if (message instanceof Error) {
      console.error(formattedLabel, message.message, message.stack);
    } else {
      console[type === 'error' ? 'error' : 'log'](
        formattedLabel,
        message,
        ...args,
      );
    }
  };

  const logger: ILogger = {
    level: 'info',
    labels: {},

    error: (message: unknown, ...args: unknown[]): void =>
      log('error', message, ...args),
    warn: (message: unknown, ...args: unknown[]): void =>
      log('warn', message, ...args),
    info: (message: unknown, ...args: unknown[]): void =>
      log('info', message, ...args),
    ready: (message: unknown, ...args: unknown[]): void =>
      log('ready', message, ...args),
    success: (message: unknown, ...args: unknown[]): void =>
      log('success', message, ...args),
    debug: (message: unknown, ...args: unknown[]): void =>
      log('debug', message, ...args),

    setLevel(newLevel: LogLevelName | number): void {
      currentLevel =
        typeof newLevel === 'string'
          ? (LOG_TYPES[newLevel]?.level ?? LOG_TYPES.info.level)
          : newLevel;
    },
  };

  Object.defineProperty(logger, 'level', {
    get: (): LogLevelName => {
      const entry = Object.entries(LOG_TYPES).find(
        ([, cfg]) => cfg.level === currentLevel,
      );
      return entry ? (entry[0] as LogLevelName) : 'info';
    },
    set: (v: LogLevelName) => logger.setLevel(v),
  });

  return logger;
}

const logger: ILogger = createLogger(PREFIX);

export { logger, createLogger };
export type { ILogger as Logger };
