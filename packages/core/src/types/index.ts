// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../../node_modules/webpack/module.d.ts" />

import type { container } from 'webpack';
import type { WebpackSharedScope } from '../integrations/webpack/types';

export type ModuleFederationPluginOptions = ConstructorParameters<
  typeof container.ModuleFederationPlugin
>['0'];

// TODO: Create generic interface.
export type SharedScopes = WebpackSharedScope;

export type Shared = ModuleFederationPluginOptions['shared'];
export type Remotes = ModuleFederationPluginOptions['remotes'];
export type SharedObject = Extract<Shared, ModuleFederationPluginOptions>;
export type SharedConfig = Extract<
  SharedObject[keyof SharedObject],
  { eager?: boolean }
>;
export type ExternalsType = Required<
  ModuleFederationPluginOptions['remoteType']
>;

type ModulePath = string;

export type RemoteContainer = {
  __initializing?: boolean;
  __initialized?: boolean;
  get(modulePath: ModulePath): () => unknown;
  init: (sharedScope?: SharedScopes) => void;
};

export type AsyncContainer = Promise<RemoteContainer>;

export type RemoteOptions = {
  global: string;
  url: string;
  uniqueKey?: string;
};

export type RuntimeRemote = Partial<RemoteOptions> & {
  asyncContainer?: AsyncContainer | (() => AsyncContainer);
};

export type RuntimeRemotesMap = Record<string, RuntimeRemote>;

// Types for MFClient
export type EventTypes = 'loadStart' | 'loadComplete' | 'loadError';

export type GetModuleOptions = {
  modulePath: string;
  exportName?: string;
  remoteContainer: RemoteContainer;
};

export type GetModulesOptions = {
  modulePaths: string[];
  remoteContainer: RemoteContainer;
};

export type RemoteScope = {
  [index: string]:
    | AsyncContainer
    | string
    | undefined
    | Record<string, string>
    | SharedScopes;
  _config: Record<string, string>;
  __sharing_scope__?: SharedScopes;
};
