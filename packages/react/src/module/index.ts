import autoFetchDataPlugin from './data-fetch/runtime-plugin';

export type { DataFetchParams, NoSSRRemoteInfo } from './types';
export { ERROR_TYPE } from './constant';
export type {
  CreateRemoteComponentOptions,
  IProps as CollectSSRAssetsOptions,
} from './createRemoteComponent';

// avoid import react directly https://github.com/web-infra-dev/modern.js/issues/7096
export const kit = {
  get createRemoteSSRComponent(): typeof import('./createRemoteComponent').createRemoteSSRComponent {
    return require('./createRemoteComponent').createRemoteSSRComponent;
  },
  get createRemoteComponent(): typeof import('./createRemoteComponent').createRemoteComponent {
    return require('./createRemoteComponent').createRemoteComponent;
  },
  get collectSSRAssets(): typeof import('./createRemoteComponent').collectSSRAssets {
    return require('./createRemoteComponent').collectSSRAssets;
  },
  get wrapNoSSR(): typeof import('./wrapNoSSR').wrapNoSSR {
    return require('./wrapNoSSR').wrapNoSSR;
  },
  get injectDataFetch(): typeof import('./data-fetch/inject-data-fetch').injectDataFetch {
    return require('./data-fetch/inject-data-fetch').injectDataFetch;
  },
  get callDataFetch(): typeof import('./data-fetch/call-data-fetch').callDataFetch {
    return require('./data-fetch/call-data-fetch').callDataFetch;
  },
  get setSSREnv(): typeof import('./utils').setSSREnv {
    return require('./utils').setSSREnv;
  },
};

export { autoFetchDataPlugin };
