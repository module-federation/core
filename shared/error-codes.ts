export const runtimeCodes = {
  'RUNTIME-001': 'Failed to get remoteEntry exports.',
};

export const buildCodes = {
  'BUILD-001': 'build desc',
};

export const typeCodes = {
  'TYPE-001': 'type desc',
};

export const errorCodes = {
  ...runtimeCodes,
  ...buildCodes,
  ...typeCodes,
};
