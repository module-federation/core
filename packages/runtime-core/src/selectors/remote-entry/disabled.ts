import type { getRemoteEntry as loadRemoteEntry } from '../../utils/load';

export const getRemoteEntry: typeof loadRemoteEntry = async () => {
  throw new Error(
    'Remote loading is disabled by experiments.optimization.disableRemote.',
  );
};
