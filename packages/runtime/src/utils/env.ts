declare global {
  // eslint-disable-next-line no-var
  var FEDERATION_DEBUG: string | undefined,
    FEDERATION_BUILD_IDENTIFIER: string | undefined;
}

export function isDevelopmentMode(): boolean {
  return true;
}

export function getBuilderId(): string {
  return typeof FEDERATION_BUILD_IDENTIFIER !== 'undefined'
    ? FEDERATION_BUILD_IDENTIFIER
    : '';
}

export function isDebugMode(): boolean {
  return typeof FEDERATION_DEBUG !== 'undefined' && Boolean(FEDERATION_DEBUG);
}

export function isBrowserEnv(): boolean {
  return typeof window !== 'undefined';
}
