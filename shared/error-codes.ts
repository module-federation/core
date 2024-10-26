export const runtimeCodes = {
  'RUNTIME-001': 'Failed to get remoteEntry exports.',
  'RUNTIME-002': 'The remote entry interface does not contain "init"',
  'RUNTIME-003': 'Failed to get manifest.',
  'RUNTIME-004': 'Failed to locate remote.',
  'RUNTIME-005': 'Invalid loadShareSync function call from bundler runtime',
  'RUNTIME-006': 'Invalid loadShareSync function call from runtime',
  'RUNTIME-007': 'Failed to get remote snapshot.',
};

// export const buildCodes = {
//   'BUILD-001': 'build desc',
// };

// export const typeCodes = {
//   'TYPE-001': 'type desc',
// };

export const errorCodes = {
  ...runtimeCodes,
  // ...buildCodes,
  // ...typeCodes,
};

const getDocsUrl = (errorCode: string) => {
  const type = errorCode.split('-')[0].toLowerCase();
  return `https://module-federation.io/guide/troubleshooting/${type}/${errorCode}`;
};

export const getShortErrorMsg = (
  errorCode: keyof typeof runtimeCodes,
  args: Record<string, unknown>,
  orignalErrorMsg: string,
) => {
  return [
    errorCodes[errorCode],
    `args: ${JSON.stringify(args)}`,
    getDocsUrl(errorCode),
    `Original Error Message:\n ${orignalErrorMsg}`,
  ].join('\n');
};
