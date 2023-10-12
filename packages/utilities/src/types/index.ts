// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../../node_modules/webpack/module.d.ts" />

import type { container, WebpackOptionsNormalized } from 'webpack';

export type ModuleFederationPluginOptions = ConstructorParameters<
  typeof container.ModuleFederationPlugin
>['0'];

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

/**
 * The method of providing a remote base url, either as a string or a function that returns a promise.
 * @typedef {string | function} RemoteUrl
 */
export type RemoteUrl = string | (() => Promise<string>);

/**
 * The set of events available for a remote.
 */
export interface RemoteEvents {
  beforePreloadRemote: RemoteEventCallback;
  beforeLoadRemote: RemoteModuleEventCallback;
  remoteLoaded: RemoteModuleEventCallback;
}

/**
 * Interface for ImportRemoteOptions
 * @interface
 * @property {RemoteUrl} url - The url of the remote module
 * @property {string} scope - The scope of the remote module
 * @property {string} module - The module to import
 * @property {string} [remoteEntryFileName] - The filename of the remote entry
 * @property {boolean} [bustRemoteEntryCache] - Flag to bust the remote entry cache
 */
export interface ImportRemoteOptions {
  url: RemoteUrl;
  scope: string;
  module: string;
  remoteEntryFileName?: string;
  bustRemoteEntryCache?: boolean;
  esm?: boolean;
  remoteEvents?: RemoteEvents;
}

/**
 * RemoteEvent is an event containing the container scope in context.
 */
export type RemoteEvent = {
  scope: ImportRemoteOptions['scope'];
};

/**
 * RemoteModuleEvent is an event containing the container scope and module in context.
 */
export type RemoteModuleEvent = {
  scope: ImportRemoteOptions['scope'];
  module: ImportRemoteOptions['module'];
  remoteContainer?: WebpackRemoteContainer;
};

/**
 * RemoteEventCallback is a callback function for a RemoteEvent.
 */
export type RemoteEventCallback = (event: RemoteEvent) => Promise<void>;

/**
 * RemoteModuleEventCallback is a callback function for a RemoteModuleEvent.
 */
export type RemoteModuleEventCallback = (
  event: RemoteModuleEvent,
) => Promise<void>;
