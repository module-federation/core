// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../../node_modules/webpack/module.d.ts" />

import type { container, WebpackOptionsNormalized } from 'webpack';
import { WebpackSharedScope } from '../integrations/webpack/types';

declare global {
  // eslint-disable-next-line no-var
  var __remote_scope__: RemoteScope;

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      __remote_scope__: Record<string, WebpackRemoteContainer>;
    }
  }

  interface Window {
    [index: string | number]: unknown;
    // TODO: to match promise template system, can be removed once promise template is gone
    remoteLoading: Record<string, AsyncContainer | undefined>;
    __remote_scope__: Record<string, WebpackRemoteContainer>;
  }
}

export type ModuleFederationPluginOptions = ConstructorParameters<
  typeof container.ModuleFederationPlugin
>['0'];

// TODO: Keep webpack as standard
export type SharedScope = WebpackSharedScope;

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

export type WebpackRemoteContainer = {
  __initialized?: boolean;
  get(modulePath: ModulePath): () => any;
  init: (obj?: typeof __webpack_share_scopes__) => void;
};

export type AsyncContainer = Promise<WebpackRemoteContainer>;

export type RemoteData = {
  global: string;
  url: string;
  uniqueKey?: string;
};

export type RuntimeRemote = Partial<RemoteData> & {
  asyncContainer?: AsyncContainer | (() => AsyncContainer);
};

export type RuntimeRemotesMap = Record<string, RuntimeRemote>;

type Module = WebpackOptionsNormalized['module'];
type Rules = Module['rules'];
export type RuleSetRuleUnion = Rules[0];
type RuleSetRule = Extract<RuleSetRuleUnion, { loader?: string }>;
export type Loader = Extract<RuleSetRule['use'], { loader?: string }>;

// Types for MFClient
export type EventTypes = 'loadStart' | 'loadComplete' | 'loadError';
type NextRoute = string;
export type PageMap = Record<NextRoute, ModulePath>;

export type GetModuleOptions = {
  modulePath: string;
  exportName?: string;
  remoteContainer: string | RemoteData;
};

export type GetModulesOptions = {
  modulePaths: string[];
  remoteContainer: WebpackRemoteContainer;
};

export type ModuleFederationRuntimeOptions = {
  scriptFactory: IRemoteScriptFactory;
  sharingScopeFactory: ISharingScopeFactory;
};

export type ModuleFederationRuntime = {
  scriptFactory: IRemoteScriptFactory;
  sharingScopeFactory: ISharingScopeFactory;
};

export type RemoteScope = {
  [index: string]:
    | AsyncContainer
    | string
    | undefined
    | Record<string, string>
    | SharedScope
    | ModuleFederationRuntime;
  _config: Record<string, string>;
  __sharing_scope__?: SharedScope;
  _runtime?: ModuleFederationRuntime;
};

export interface IRemoteScriptFactory {
  loadScript: (
    scope: RemoteScope,
    containerKey: string,
    remoteOptions: RemoteOptions
  ) => AsyncContainer;
}

export interface ISharingScopeFactory {
  initializeSharingScope: (scopeName: string) => Promise<SharedScope>;
}
