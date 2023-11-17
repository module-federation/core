declare global {
  // eslint-disable-next-line no-var
  var FEDERATION_DEBUG: string | undefined;
}

function isBrowserEnv(): boolean {
  return typeof window !== 'undefined';
}

function isDebugMode(): boolean {
  if (typeof process !== 'undefined' && process.env && process.env["FEDERATION_DEBUG"]) {
    return Boolean(process.env["FEDERATION_DEBUG"]);
  }
  return typeof FEDERATION_DEBUG !== 'undefined' && Boolean(FEDERATION_DEBUG);
}

const getProcessEnv = function (): Record<string, string | undefined> {
  return typeof process !== 'undefined' && process.env ? process.env : {};
};

export { isBrowserEnv, isDebugMode, getProcessEnv };
