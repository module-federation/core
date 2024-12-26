import util from 'util';

export function isRegExp(target: any) {
  return util.types.isRegExp(target);
}

export * from './constant';
export * from './autoDeleteSplitChunkCacheGroups';
