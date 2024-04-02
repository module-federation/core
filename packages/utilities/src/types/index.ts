// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../../node_modules/webpack/module.d.ts" />
import type { moduleFederationPlugin } from '@module-federation/sdk';

import type { container, WebpackOptionsNormalized } from 'webpack';

export type ModuleFederationPluginOptions =
  moduleFederationPlugin.ModuleFederationPluginOptions;

export type WebpackRequire = {
  l: (
    url: string | undefined,
    cb: (event: any) => void,
    id: string | number,
  ) => Record<string, unknown>;
};

export type WebpackShareScopes = Record<
  string,
  Record<
    string,
    { loaded?: 1; get: () => Promise<unknown>; from: string; eager: boolean }
  >
> & {
  default?: string;
};
export type GlobalScopeType = {
  [K: string]: any;
  _config?: Record<string | number, any>;
  _medusa?: Record<string, any> | undefined;
  remoteLoading?: Record<string, Promise<AsyncContainer>>;
};

export declare const __webpack_init_sharing__: (
  parameter: string,
) => Promise<void>;

export interface NextFederationPluginExtraOptions {
  enableImageLoaderFix?: boolean;
  enableUrlLoaderFix?: boolean;
  exposePages?: boolean;
  skipSharingNextInternals?: boolean;
  automaticPageStitching?: boolean;
  debug?: boolean;
}

export interface NextFederationPluginOptions
  extends ModuleFederationPluginOptions {
  extraOptions: NextFederationPluginExtraOptions;
}

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
  asyncContainer?: AsyncContainer;
  global?: string;
  url?: string;
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

export type RemoteVars = Record<
  string,
  | Promise<WebpackRemoteContainer>
  | string
  | (() => Promise<WebpackRemoteContainer>)
>;
