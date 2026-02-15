import type { moduleFederationPlugin } from '@module-federation/sdk';

export interface ModuleFederationConfig
  extends moduleFederationPlugin.ModuleFederationPluginOptions {
  /**
   * @deprecated Use runtimePlugins instead. Scheduled for removal in the next major version.
   */
  plugins?: string[];
  /**
   * Federated types (d.ts) support. When enabled, Metro bundle commands can
   * generate `@mf-types.zip` and `@mf-types.d.ts` for consumption by hosts.
   */
  dts?: boolean | moduleFederationPlugin.PluginDtsOptions;
}

export type ShareObject = Record<string, moduleFederationPlugin.SharedConfig>;

export interface ModuleFederationConfigNormalized {
  name: string;
  filename: string;
  remotes: Record<string, string>;
  exposes: Record<string, string>;
  shared: ShareObject;
  shareStrategy: moduleFederationPlugin.SharedStrategy;
  plugins: string[];
  dts: boolean | moduleFederationPlugin.PluginDtsOptions;
}

export type ModuleFederationExtraOptions = {
  flags?: MetroMFFlags;
};

export type MetroMFFlags = {
  unstable_patchHMRClient?: boolean;
  unstable_patchInitializeCore?: boolean;
  unstable_patchRuntimeRequire?: boolean;
};
