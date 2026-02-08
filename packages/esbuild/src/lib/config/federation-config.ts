import { SkipList } from '../core/default-skip-list';

export interface SharedConfig {
  singleton?: boolean;
  strictVersion?: boolean;
  requiredVersion?: string;
  version?: string;
  includeSecondaries?: boolean;
}

export interface FederationConfig {
  name?: string;
  exposes?: Record<string, string>;
  shared?: Record<string, SharedConfig>;
  sharedMappings?: Array<string>;
  skip?: SkipList;
}

/**
 * Normalized shared module configuration.
 * All boolean fields are required (defaulted during normalization).
 */
export interface NormalizedSharedConfig {
  /** Allow only a single version of this module in share scope */
  singleton: boolean;
  /** Throw error on version mismatch (default: false) */
  strictVersion: boolean;
  /** Semver version requirement for this module */
  requiredVersion: string;
  /** Actual version of the provided module */
  version?: string;
  /** Load eagerly (inline) rather than as a lazy chunk */
  eager?: boolean;
  /** Include subpath exports of the package */
  includeSecondaries?: boolean;
  /**
   * Disable the fallback module (no local bundled version).
   * When set to false, the shared module must be provided by another container.
   */
  import?: false | string;
  /**
   * Custom key in the share scope (defaults to the package name).
   * Used when the package name differs from the share scope key.
   */
  shareKey?: string;
  /**
   * Custom share scope name for this module (defaults to the global shareScope).
   * Enables placing specific modules in isolated share scopes.
   */
  shareScope?: string;
  /**
   * Explicit package name for version auto-detection.
   * Used when the import request differs from the package.json name.
   */
  packageName?: string;
}

/**
 * Advanced remote configuration with share scope override.
 */
export interface NormalizedRemoteConfig {
  /** The remote entry URL or name@url string */
  entry: string;
  /** Custom share scope for this remote (defaults to global shareScope) */
  shareScope?: string;
}

/**
 * Fully normalized federation configuration.
 * All optional fields have been defaulted and validated.
 */
export interface NormalizedFederationConfig {
  /** Unique name for this federation container */
  name: string;
  /** Remote entry filename (e.g., 'remoteEntry.js') */
  filename?: string;
  /** Modules to expose to other containers */
  exposes?: Record<string, string>;
  /** Shared dependency configurations */
  shared?: Record<string, NormalizedSharedConfig>;
  /**
   * Remote containers to consume.
   * Values can be a URL string or a NormalizedRemoteConfig object.
   */
  remotes?: Record<string, string | NormalizedRemoteConfig>;
  /** Share scope negotiation strategy */
  shareStrategy?: 'version-first' | 'loaded-first';
  /**
   * Default share scope name for all shared modules (defaults to 'default').
   * Can be overridden per-shared-module via NormalizedSharedConfig.shareScope.
   */
  shareScope?: string;
  /**
   * Runtime plugin file paths or package names to inject into the MF runtime.
   * Each plugin is loaded at runtime and added to the MF instance.
   */
  runtimePlugins?: string[];
  /**
   * Custom public path for container assets.
   * Used in the manifest and for resolving relative chunk paths.
   * Defaults to 'auto'.
   */
  publicPath?: string;
}
