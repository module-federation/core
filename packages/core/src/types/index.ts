// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../../node_modules/webpack/module.d.ts" />

import type { container } from 'webpack';

export type ModuleFederationPluginOptions = ConstructorParameters<
  typeof container.ModuleFederationPlugin
>['0'];

export type SharedScope = Record<
  string,
  Record<
    string,
    { loaded?: 1; get: () => Promise<unknown>; from: string; eager: boolean }
  >
>;

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
  init: (sharedScope?: SharedScope) => void;
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
    | SharedScope;
  _config: Record<string, string>;
  __sharing_scope__?: SharedScope;
};

export interface IRemoteScriptFactory {
  /**
   * Loads a remote URL and returns a promise that resolves to the remote container.
   * Attaches the remote container to the scope object using the container key.
   */
  loadScript: RemoteScriptLoader;
}

export type RemoteScriptLoader = (
  scope: RemoteScope,
  containerKey: string,
  remoteOptions: RemoteOptions
) => AsyncContainer;

export interface ISharingScopeFactory {
  initializeSharingScope: (scopeName: string) => Promise<SharedScope>;
}
