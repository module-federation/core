import type {
  ModuleFederationOptions,
  RsbuildPlugin,
} from '@module-federation/rsbuild-plugin';

export declare function pluginModuleFederationRspeedy(
  options?: ModuleFederationOptions & {
    runtimePlugins?: Array<string | [string, any]> | string;
    environment?: string;
  },
): RsbuildPlugin;

export default pluginModuleFederationRspeedy;
