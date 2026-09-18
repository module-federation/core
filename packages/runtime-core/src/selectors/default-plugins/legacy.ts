import { generatePreloadAssetsPlugin } from '../../plugins/generate-preload-assets';
import { snapshotPlugin } from '../../plugins/snapshot';

declare const FEDERATION_OPTIMIZE_NO_REMOTE: boolean;
declare const FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN: boolean;

const useRemote =
  typeof FEDERATION_OPTIMIZE_NO_REMOTE === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_REMOTE
    : true;
const useSnapshot =
  typeof FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN
    : true;

export function createDefaultPlugins() {
  return useRemote && useSnapshot
    ? [snapshotPlugin(), generatePreloadAssetsPlugin()]
    : [];
}
