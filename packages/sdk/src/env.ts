import { BROWSER_LOG_KEY } from './constant';

declare global {
  // eslint-disable-next-line no-var
  var FEDERATION_DEBUG: string | undefined;
}

import { isBrowserEnvValue } from '#mf/env';

function isBrowserEnv(): boolean {
  return isBrowserEnvValue;
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
