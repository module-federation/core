import { helpers } from '@module-federation/runtime-core';
import { getGlobalFederationInstance } from './utils';
export type {
  IGlobalUtils,
  IShareUtils,
} from '@module-federation/runtime-core';

export default {
  global: {
    ...helpers.global,
    getGlobalFederationInstance,
  },
  share: helpers.share,
};
