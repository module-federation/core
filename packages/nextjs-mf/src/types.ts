import type { container } from 'webpack';

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

type Container = {
  get: () => void;
  init: (obj: typeof __webpack_share_scopes__['']) => void;
};

export type AsyncContainer = Promise<Container>;

export type RuntimeRemote = {
  asyncContainer?: AsyncContainer;
  global?: string;
  url?: string;
};

export type RuntimeRemotesMap = Record<string, RuntimeRemote>;
