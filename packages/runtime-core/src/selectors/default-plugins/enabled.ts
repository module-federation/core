import { generatePreloadAssetsPlugin } from '../../plugins/generate-preload-assets';
import { snapshotPlugin } from '../../plugins/snapshot';

export function createDefaultPlugins() {
  return [snapshotPlugin(), generatePreloadAssetsPlugin()];
}
