export type ApiTargetProperties = import('./target').ApiTargetProperties;
export type EcmaTargetProperties = import('./target').EcmaTargetProperties;
export type PlatformTargetProperties =
  import('./target').PlatformTargetProperties;
export type BrowserslistHandlerConfig = {
  configPath?: string | undefined;
  env?: string | undefined;
  query?: string | undefined;
};
/**
 * @param {string[]} browsers supported browsers list
 * @returns {EcmaTargetProperties & PlatformTargetProperties & ApiTargetProperties} target properties
 */
export function resolve(
  browsers: string[],
): EcmaTargetProperties & PlatformTargetProperties & ApiTargetProperties;
/**
 * @param {string | null | undefined} input input string
 * @param {string} context the context directory
 * @returns {string[] | undefined} selected browsers
 */
export function load(
  input: string | null | undefined,
  context: string,
): string[] | undefined;
