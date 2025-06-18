import autoFetchDataPlugin from './data-fetch/runtime-plugin';

export { ERROR_TYPE } from './constant';
export type { DataFetchParams, NoSSRRemoteInfo } from './types';
export type {
  CreateLazyComponentOptions,
  IProps as CollectSSRAssetsOptions,
} from './createLazyComponent';

export { createLazyComponent, collectSSRAssets } from './createLazyComponent';

export { wrapNoSSR } from './wrapNoSSR';

export { injectDataFetch, callDataFetch } from './data-fetch';

export { setSSREnv } from './utils';

export { autoFetchDataPlugin };
