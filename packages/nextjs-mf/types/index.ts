// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../node_modules/webpack/module.d.ts" />

import type { container, WebpackOptionsNormalized } from 'webpack';

export type ModuleFederationPluginOptions = ConstructorParameters<
  typeof container.ModuleFederationPlugin
>['0'];

export interface NextFederationPluginExtraOptions {
  enableImageLoaderFix?: boolean;
  enableUrlLoaderFix?: boolean;
  exposePages?: Record<string, unknown>;
  skipSharingNextInternals?: boolean;
  automaticPageStitching?: boolean;
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
  get(modulePath: ModulePath): () => any;
  init: (obj: typeof __webpack_share_scopes__[string]) => void;
};

export type AsyncContainer = Promise<WebpackRemoteContainer>;

export type RemoteData = {
  global: string;
  url: string;
};

export type RuntimeRemote = Partial<RemoteData> & {
  asyncContainer?: AsyncContainer;
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
