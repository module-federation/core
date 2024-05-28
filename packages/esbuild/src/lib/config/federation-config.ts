import { SkipList } from '../core/default-skip-list';
import { MappedPath } from '../utils/mapped-paths';

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

export interface NormalizedSharedConfig {
  singleton: boolean;
  strictVersion: boolean;
  requiredVersion: string;
  version?: string;
  eager?: boolean;
  includeSecondaries?: boolean;
}

export interface NormalizedFederationConfig {
  name: string;
  filename?: string;
  exposes?: Record<string, string>;
  shared?: Record<string, NormalizedSharedConfig>;
  remotes?: Record<string, string>;
}
