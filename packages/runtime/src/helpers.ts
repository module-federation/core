import { helpers } from '@module-federation/runtime-core';
import { getGlobalFederationInstance } from './utils';

export type {
  IGlobalUtils,
  IShareUtils,
} from '@module-federation/runtime-core';

export const global = {
  ...helpers.global,
  getGlobalFederationInstance,
};

export const share = helpers.share;

export const utils = helpers.utils;

const runtimeHelpers = {
  global,
  share,
  utils,
};

export default runtimeHelpers as {
  global: typeof helpers.global & {
    getGlobalFederationInstance: typeof getGlobalFederationInstance;
  };
  share: typeof helpers.share;
  utils: typeof helpers.utils;
};
