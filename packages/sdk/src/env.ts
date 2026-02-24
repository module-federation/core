import { BROWSER_LOG_KEY } from './constant';

declare global {
  // eslint-disable-next-line no-var
  var FEDERATION_DEBUG: string | undefined;
}

// Declare the ENV_TARGET constant that will be defined by DefinePlugin
declare const ENV_TARGET: 'web' | 'node';

const detectBrowserEnv = () =>
  typeof ENV_TARGET !== 'undefined'
    ? ENV_TARGET === 'web'
    : typeof window !== 'undefined' && typeof window.document !== 'undefined';

const isBrowserEnvValue = detectBrowserEnv();

function isBrowserEnv(): boolean {
  return detectBrowserEnv();
}

function isReactNativeEnv(): boolean {
  return (
    typeof navigator !== 'undefined' && navigator?.product === 'ReactNative'
  );
}

function isBrowserDebug() {
  try {
    if (isBrowserEnv() && window.localStorage) {
      return Boolean(localStorage.getItem(BROWSER_LOG_KEY));
    }
  } catch (error) {
    return false;
  }
  return false;
}

function isDebugMode(): boolean {
  if (
    typeof process !== 'undefined' &&
    process.env &&
    process.env['FEDERATION_DEBUG']
  ) {
    return Boolean(process.env['FEDERATION_DEBUG']);
  }

  if (typeof FEDERATION_DEBUG !== 'undefined' && Boolean(FEDERATION_DEBUG)) {
    return true;
  }

  return isBrowserDebug();
}

const getProcessEnv = function (): Record<string, string | undefined> {
  return typeof process !== 'undefined' && process.env ? process.env : {};
};

export {
  isBrowserEnv,
  isBrowserEnvValue,
  isReactNativeEnv,
  isDebugMode,
  getProcessEnv,
};
