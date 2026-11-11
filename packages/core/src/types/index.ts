// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../../webpack/module.d.ts" />

export interface SharedScope {
  default: Record<
    string,
    Record<
      string,
      { loaded?: 1; get: () => Promise<unknown>; from: string; eager: boolean }
    >
  >;
}

type ModulePath = string;
type ModuleFactory = () => unknown;

export interface RemoteContainer {
  __initializing?: boolean;
  __initialized?: boolean;
  get(modulePath: ModulePath): Promise<ModuleFactory>;
  init: (obj?: typeof __webpack_share_scopes__) => void;
}

export type AsyncContainer = Promise<RemoteContainer>;

export interface RemoteOptions {
  global: string;
  url: string;
  uniqueKey?: string;
}

export interface GetModuleOptions {
  modulePath: string;
  exportName?: string;
  remoteContainer: RemoteContainer;
}

export interface GetModulesOptions {
  modulePaths: string[];
  remoteContainer: RemoteContainer;
}

export interface RemoteScope {
  [index: string]:
    | AsyncContainer
    | string
    | undefined
    | Record<string, string>
    | SharedScope;
  _config: Record<string, string>;
  __sharing_scope__?: SharedScope;
}
