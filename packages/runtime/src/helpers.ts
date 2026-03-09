import {
  helpers,
  type IGlobalUtils,
  type IShareUtils,
} from '@module-federation/runtime-core';
import { getGlobalFederationInstance } from './utils';

export type {
  IGlobalUtils,
  IShareUtils,
} from '@module-federation/runtime-core';

type RuntimeGlobalUtils = IGlobalUtils & {
  getGlobalFederationInstance: typeof getGlobalFederationInstance;
};

export const global: RuntimeGlobalUtils = {
  ...helpers.global,
  getGlobalFederationInstance,
};

export const share: IShareUtils = helpers.share;

export interface IRuntimeUtils {
  matchRemoteWithNameAndExpose: typeof import('@module-federation/runtime-core').matchRemoteWithNameAndExpose;
  preloadAssets: (...args: any[]) => void;
  getRemoteInfo: typeof import('@module-federation/runtime-core').getRemoteInfo;
}

export const utils: IRuntimeUtils = helpers.utils;

const runtimeHelpers: {
  global: RuntimeGlobalUtils;
  share: IShareUtils;
  utils: IRuntimeUtils;
} = {
  global,
  share,
  utils,
};

export default runtimeHelpers;
