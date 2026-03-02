import {
  RUNTIME_001,
  RUNTIME_002,
  RUNTIME_003,
  RUNTIME_004,
  RUNTIME_005,
  RUNTIME_006,
  RUNTIME_007,
  RUNTIME_008,
  RUNTIME_009,
  RUNTIME_010,
  TYPE_001,
  BUILD_001,
  BUILD_002,
} from './error-codes';

export const runtimeDescMap = {
  [RUNTIME_001]: 'Failed to get remoteEntry exports.',
  [RUNTIME_002]: 'The remote entry interface does not contain "init"',
  [RUNTIME_003]: 'Failed to get manifest.',
  [RUNTIME_004]: 'Failed to locate remote.',
  [RUNTIME_005]: 'Invalid loadShareSync function call from bundler runtime',
  [RUNTIME_006]: 'Invalid loadShareSync function call from runtime',
  [RUNTIME_007]: 'Failed to get remote snapshot.',
  [RUNTIME_008]: 'Failed to load script resources.',
  [RUNTIME_009]: 'Please call createInstance first.',
  [RUNTIME_010]: 'The remoteEntry URL is missing from the remote snapshot.',
};

export const typeDescMap = {
  [TYPE_001]:
    'Failed to generate type declaration. Execute the below cmd to reproduce and fix the error.',
};

export const buildDescMap = {
  [BUILD_001]: 'Failed to find expose module.',
  [BUILD_002]: 'PublicPath is required in prod mode.',
};

export const errorDescMap = {
  ...runtimeDescMap,
  ...typeDescMap,
  ...buildDescMap,
};
