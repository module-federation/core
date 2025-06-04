import util from 'util';

export function isRegExp(target: any) {
  return util.types.isRegExp(target);
}

export { DEFAULT_ASSET_PREFIX } from './constant';
export { autoDeleteSplitChunkCacheGroups } from './autoDeleteSplitChunkCacheGroups';
export { addDataFetchExposes } from './addDataFetchExposes';
