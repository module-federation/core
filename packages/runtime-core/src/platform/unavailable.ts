import { isBrowserEnvValue } from '@module-federation/sdk/core';
import type { Platform } from '../type';

export const PLATFORM_UNAVAILABLE_MESSAGE =
  'No platform capability: pass capabilities.platform to load entries.';

const unavailable = () =>
  Promise.reject(new Error(PLATFORM_UNAVAILABLE_MESSAGE));

export const unavailablePlatform: Platform = {
  isBrowser: () => isBrowserEnvValue,
  loadScript: unavailable,
  loadEntry: unavailable,
};
