import type { SnapshotCapability } from '../../type';
import { generatePreloadAssetsPlugin } from '../generate-preload-assets';
import { snapshotPlugin } from './index';

export const snapshot: SnapshotCapability = {
  plugins: () => [snapshotPlugin(), generatePreloadAssetsPlugin()],
};
