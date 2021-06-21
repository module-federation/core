import type { ModuleFederationPluginOptions } from "webpack/lib/container/ModuleFederationPlugin";

export type WithModuleFederationOptions = {
  removePlugins?: string[];
};

export function withModuleFederation(
  federationPluginOptions: ModuleFederationPluginOptions,
  withModuleFederationOptions?: WithModuleFederationOptions
): (nextConfig?: any) => any;
