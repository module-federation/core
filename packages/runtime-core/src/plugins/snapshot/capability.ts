import { snapshotPlugin } from './index';
import { generatePreloadAssetsPlugin } from '../generate-preload-assets';

export const snapshot = {
  kind: 'snapshot' as const,
  plugins: () => [snapshotPlugin(), generatePreloadAssetsPlugin()],
};
