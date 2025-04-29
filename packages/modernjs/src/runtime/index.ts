export * from '@module-federation/enhanced/runtime';

// avoid import react directly https://github.com/web-infra-dev/modern.js/issues/7096
export const kit = {
  get createRemoteSSRComponent() {
    return require('./createRemoteSSRComponent').createRemoteSSRComponent;
  },
  get collectSSRAssets() {
    return require('./createRemoteSSRComponent').collectSSRAssets;
  },
};
