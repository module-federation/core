export type PackageManager = 'pnpm' | 'yarn' | 'npm' | 'bun';

export type MFRole = 'host' | 'remote' | 'host+remote' | 'unknown';

export type BundlerName = 'webpack' | 'rspack' | 'rsbuild' | 'vite' | 'unknown';

/** A single remote entry, mirrors runtime-core's Remote type (simplified for diagnostics) */
export interface MFRemoteEntry {
  name: string;
  alias?: string;
  /** URL or version string */
  entry?: string;
  version?: string;
  type?: string;
  entryGlobalName?: string;
  shareScope?: string | string[];
}

/** Shared package entry, mirrors runtime-core's SharedConfig (simplified) */
export interface MFSharedEntry {
  version?: string;
  singleton?: boolean;
  requiredVersion?: string | false;
  eager?: boolean;
  strictVersion?: boolean;
}

/** Module Federation plugin configuration, extracted from bundler config file */
export interface MFConfigInfo {
  name?: string;
  filename?: string;
  remotes?: MFRemoteEntry[];
  exposes?: Record<string, string>;
  shared?: Record<string, MFSharedEntry>;
}

/** Basic project metadata */
export interface MFProjectInfo {
  name?: string;
  root?: string;
  packageManager?: PackageManager;
  mfRole?: MFRole;
}

/** Bundler in use */
export interface MFBundlerInfo {
  name?: BundlerName;
  configFile?: string;
  version?: string;
}

/** Runtime environment snapshot */
export interface MFEnvironmentInfo {
  nodeVersion?: string;
  os?: string;
  isCI?: boolean;
}

/** Most recent diagnostic event (from .mf/diagnostics/latest.json) */
export interface MFLatestErrorEvent {
  code: string;
  message: string;
  args?: Record<string, unknown>;
  timestamp: number;
}

/** Build artifacts from dist/ */
export interface MFBuildArtifacts {
  manifest?: Record<string, unknown>;
  stats?: Record<string, unknown>;
}

/**
 * Module Federation context.
 *
 * Produced by the `mf-context` Claude skill for full project analysis,
 * or contributed partially by the runtime when an error occurs (only fields
 * known at the time of the error are set).
 *
 * All fields are optional so both full and partial contexts are valid.
 */
export interface MFContext {
  project?: MFProjectInfo;
  bundler?: MFBundlerInfo;
  mfConfig?: MFConfigInfo;
  /** Installed dependency versions: packageName → version */
  dependencies?: Record<string, string>;
  environment?: MFEnvironmentInfo;
  latestErrorEvent?: MFLatestErrorEvent;
  buildArtifacts?: MFBuildArtifacts;
}
