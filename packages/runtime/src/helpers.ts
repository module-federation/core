import { helpers } from '@module-federation/runtime-core';
import { getGlobalFederationInstance } from './utils';

export type {
  IGlobalUtils,
  IShareUtils,
} from '@module-federation/runtime-core';

export default {
  ...helpers,
  global: {
    ...helpers.global,
    getGlobalFederationInstance,
  },
} as {
  global: typeof helpers.global & {
    getGlobalFederationInstance: typeof getGlobalFederationInstance;
  };
  share: typeof helpers.share;
  utils: typeof helpers.utils;
};
