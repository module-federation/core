export { BasicPluginOptionsManager } from './BasicPluginOptionsManager';
export { ContainerManager } from './ContainerManager';
export { PKGJsonManager } from './PKGJsonManager';
export { RemoteManager } from './RemoteManager';
export { SharedManager } from './SharedManager';
export {
  CanonicalSharedPlugin,
  SharedKeysSet,
  isSharedKeyMatch,
  resolveCanonicalShareKey,
  extractSharedKeys,
  clearPackageJsonCache,
} from './resolveCanonicalShareKey';

export { UNKNOWN_MODULE_NAME } from './constant';

export * as utils from './utils';
export * as types from './types';
