import type { container } from 'webpack';
export type ModuleFederationPluginOptions = ConstructorParameters<typeof container.ModuleFederationPlugin>['0'];
export type RemotesObject = ModuleFederationPluginOptions['remotes'];
