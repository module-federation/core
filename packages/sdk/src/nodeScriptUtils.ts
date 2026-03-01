const ASYNC_NODE_STARTUP_CALL_PATTERN =
  /var\s+__webpack_exports__\s*=\s*__webpack_require__\.x\(\s*\)\s*;/;
const ENCODED_HMR_CLIENT_BOOTSTRAP_CALL =
  /__webpack_require__\("data:text\/javascript,[^"]*"\);\s*/g;

const isPromiseLike = (value: unknown): value is Promise<unknown> =>
  Boolean(value) &&
  (typeof value === 'object' || typeof value === 'function') &&
  'then' in (value as Promise<unknown>) &&
  typeof (value as Promise<unknown>).then === 'function';

const isValidIdentifier = (value: string): boolean =>
  /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value);

export const patchNodeRemoteEntryCode = (
  code: string,
  attrs?: Record<string, any>,
): string => {
  let patchedCode = code.replace(ENCODED_HMR_CLIENT_BOOTSTRAP_CALL, '');

  if (
    ASYNC_NODE_STARTUP_CALL_PATTERN.test(patchedCode) &&
    patchedCode.includes('__webpack_require__.mfAsyncStartup')
  ) {
    patchedCode = patchedCode.replace(
      ASYNC_NODE_STARTUP_CALL_PATTERN,
      'var __webpack_exports__ = __webpack_require__.x({}, []);',
    );
  }

  const globalName = attrs?.['globalName'];
  if (typeof globalName === 'string' && isValidIdentifier(globalName)) {
    patchedCode = `${patchedCode}
;if (typeof ${globalName} !== "undefined") { module.exports = ${globalName}; }`;
  }

  return patchedCode;
};

export const resolveNodeScriptExports = async (
  scriptContext: { exports: unknown; module: { exports: unknown } },
  attrs?: Record<string, any>,
): Promise<unknown> => {
  const globalName = attrs?.['globalName'];
  let exportedInterface = scriptContext.module.exports || scriptContext.exports;

  if (isPromiseLike(exportedInterface)) {
    exportedInterface = await exportedInterface;
  }

  if (
    typeof globalName === 'string' &&
    exportedInterface &&
    typeof exportedInterface === 'object' &&
    !Array.isArray(exportedInterface) &&
    globalName in (exportedInterface as Record<string, unknown>)
  ) {
    exportedInterface = (exportedInterface as Record<string, unknown>)[
      globalName
    ];
  }

  const globalContainer =
    typeof globalName === 'string'
      ? (globalThis as Record<string, unknown>)[globalName]
      : undefined;

  if (
    globalContainer !== undefined &&
    scriptContext.module.exports === exportedInterface &&
    exportedInterface &&
    typeof exportedInterface === 'object' &&
    !Array.isArray(exportedInterface) &&
    Object.keys(exportedInterface as Record<string, unknown>).length === 0
  ) {
    exportedInterface = globalContainer;
  }

  if (isPromiseLike(exportedInterface)) {
    exportedInterface = await exportedInterface;
  }

  return exportedInterface;
};
