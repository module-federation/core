import util from 'util';

export function isRegExp(target: any) {
  return util.types.isRegExp(target);
}

export { DEFAULT_ASSET_PREFIX } from '../constant';
export { autoDeleteSplitChunkCacheGroups } from './autoDeleteSplitChunkCacheGroups';
export { addDataFetchExposes } from './addDataFetchExposes';

export { updateStatsAndManifest } from './manifest';
export type { StatsAssetResource } from './manifest';

export {
  patchSSRRspackConfig,
  createSSRREnvConfig,
  createSSRMFConfig,
  setSSREnv,
  SSR_DIR,
  SSR_ENV_NAME,
} from './ssr';
