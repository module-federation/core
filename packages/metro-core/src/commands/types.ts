export interface Config {
  root: string;
  platforms: Record<string, object>;
  reactNativePath: string;
  logger?: Logger;
}

export interface Logger {
  success: (...messages: Array<unknown>) => void;
  info: (...messages: Array<unknown>) => void;
  warn: (...messages: Array<unknown>) => void;
  error: (...messages: Array<unknown>) => void;
  debug: (...messages: Array<unknown>) => void;
  log: (...messages: Array<unknown>) => void;
}
