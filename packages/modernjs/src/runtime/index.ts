export * from '@module-federation/enhanced/runtime';

export type { DataFetchParams } from '../interfaces/global';
export { ERROR_TYPE } from '../constant';
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
};
