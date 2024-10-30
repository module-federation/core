import {
  RUNTIME_001,
  RUNTIME_002,
  RUNTIME_003,
  RUNTIME_004,
  RUNTIME_005,
  RUNTIME_006,
  RUNTIME_007,
} from './error-codes';

export const runtimeDescMap = {
  [RUNTIME_001]: 'Failed to get remoteEntry exports.',
  [RUNTIME_002]: 'The remote entry interface does not contain "init"',
  [RUNTIME_003]: 'Failed to get manifest.',
  [RUNTIME_004]: 'Failed to locate remote.',
  [RUNTIME_005]: 'Invalid loadShareSync function call from bundler runtime',
  [RUNTIME_006]: 'Invalid loadShareSync function call from runtime',
  [RUNTIME_007]: 'Failed to get remote snapshot.',
};

export const errorDescMap = {
  ...runtimeDescMap,
};
