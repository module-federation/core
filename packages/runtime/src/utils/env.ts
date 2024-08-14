export { isBrowserEnv, isDebugMode } from '@module-federation/sdk';

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
