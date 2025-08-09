export interface SharedConfig {
  singleton: boolean;
  eager: boolean;
  version: string;
  requiredVersion: string;
  import?: false;
}

export type Shared = Record<string, SharedConfig>;

export interface ModuleFederationConfig {
  name: string;
  filename?: string;
  remotes?: Record<string, string>;
  exposes?: Record<string, string>;
  shared?: Shared;
  shareStrategy?: 'loaded-first' | 'version-first';
  plugins?: string[];
}

export type ModuleFederationConfigNormalized = Required<ModuleFederationConfig>;

export type ModuleFederationExtraOptions = {
  flags?: MetroMFFlags;
};

export type MetroMFFlags = {
  unstable_patchHMRClient?: boolean;
  unstable_patchInitializeCore?: boolean;
  unstable_patchRuntimeRequire?: boolean;
};
