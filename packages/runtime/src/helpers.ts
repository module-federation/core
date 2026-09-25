import {
  helpers,
  ModuleFederation,
  type IGlobalUtils,
  type IShareUtils,
} from '@module-federation/runtime-core';
import { getGlobalFederationInstance } from './instance';

export type {
  IGlobalUtils,
  IShareUtils,
} from '@module-federation/runtime-core';

type RuntimeGlobalUtils = IGlobalUtils & {
  getGlobalFederationInstance: (
    name: string,
    version: string | undefined,
  ) => ModuleFederation | undefined;
};

export const global: RuntimeGlobalUtils = {
  ...helpers.global,
  getGlobalFederationInstance: (name, version) =>
    getGlobalFederationInstance(
      name,
      version,
      ModuleFederation.runtimeCapabilities,
    ),
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
