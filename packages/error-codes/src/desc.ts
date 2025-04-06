import {
  RUNTIME_001,
  RUNTIME_002,
  RUNTIME_003,
  RUNTIME_004,
  RUNTIME_005,
  RUNTIME_006,
  RUNTIME_007,
  RUNTIME_008,
  TYPE_001,
  BUILD_001,
} from './error-codes';

const failedTo = 'Failed to';
const remote = 'remote';
const get = 'get';
const invalid = 'Invalid';
const loadShareSync = 'loadShareSync function call from';

export const runtimeDescMap = {
  [RUNTIME_001]: `${failedTo} ${get} ${remote}Entry exports.`,
  [RUNTIME_002]: `The ${remote} entry interface does not contain "init"`,
  [RUNTIME_003]: `${failedTo} ${get} manifest.`,
  [RUNTIME_004]: `${failedTo} locate ${remote}.`,
  [RUNTIME_005]: `${invalid} ${loadShareSync} bundler runtime`,
  [RUNTIME_006]: `${invalid} ${loadShareSync} runtime`,
  [RUNTIME_007]: `${failedTo} ${get} ${remote} snapshot.`,
  [RUNTIME_008]: `${failedTo} load script resources.`,
};

export const typeDescMap = {
  [TYPE_001]: `${failedTo} generate type declaration.`,
};

export const buildDescMap = {
  [BUILD_001]: `${failedTo} find expose module.`,
};

export const errorDescMap = {
  ...runtimeDescMap,
  ...typeDescMap,
  ...buildDescMap,
};
