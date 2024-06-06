export function isDevelopmentMode(): boolean {
  return true;
}

export function getBuilderId(): string {
  //@ts-ignore
  return typeof FEDERATION_BUILD_IDENTIFIER !== 'undefined'
    ? //@ts-ignore
      FEDERATION_BUILD_IDENTIFIER
    : '';
}

export function isDebugMode(): boolean {
  return typeof FEDERATION_DEBUG !== 'undefined' && Boolean(FEDERATION_DEBUG);
}

export function isBrowserEnv(): boolean {
  return typeof window !== 'undefined';
}
