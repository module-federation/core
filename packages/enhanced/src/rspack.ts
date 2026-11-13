export {
  ModuleFederationPlugin,
  GetPublicPathPlugin,
  TreeShakingSharedPlugin,
  PLUGIN_NAME,
} from '@module-federation/rspack/plugin';
export { createModuleFederationConfig } from '@module-federation/sdk';
export { setCompilationBuildVersion } from '@module-federation/manifest';
export {
  createDevBuildConnection,
  type DevBuildCallbacks,
  type DevBuildConnectionOptions,
  type DevBuildPublication,
  type DevBuildRemote,
  type DevBuildSource,
  type DevBuildStatus,
  type DevBuildUpdate,
} from '@module-federation/dts-plugin';
