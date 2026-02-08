import {
  prepareSkipList,
  isInSkipList,
  PreparedSkipList,
} from '../core/default-skip-list';
import { shareAll } from './share-utils';

interface SharedConfig {
  requiredVersion?: string;
  singleton?: boolean;
  strictVersion?: boolean;
  version?: string;
  eager?: boolean;
  includeSecondaries?: boolean;
  /** Set to false to disable local fallback (module must come from share scope) */
  import?: false | string;
  /** Custom key in share scope (defaults to package name) */
  shareKey?: string;
  /** Override share scope for this specific module */
  shareScope?: string;
  /** Explicit package name for version detection */
  packageName?: string;
}

interface RemoteConfig {
  /** Remote entry URL */
  external: string | string[];
  /** Override share scope for this remote */
  shareScope?: string;
}

interface FederationConfig {
  name?: string;
  filename?: string;
  exposes?: Record<string, string>;
  remotes?: Record<string, string | RemoteConfig>;
  shared?: Record<string, SharedConfig>;
  skip?: string[];
  /** Default share scope name (defaults to 'default') */
  shareScope?: string;
  /** Share negotiation strategy */
  shareStrategy?: 'version-first' | 'loaded-first';
  /** Runtime plugin file paths */
  runtimePlugins?: string[];
  /** Custom public path */
  publicPath?: string;
}

export function withFederation(config: FederationConfig) {
  const skip: PreparedSkipList = prepareSkipList(config.skip ?? []);

  // Ensure filename has .js extension for proper container entry matching
  let filename = config.filename ?? 'remoteEntry.js';
  if (!filename.endsWith('.js') && !filename.endsWith('.mjs')) {
    filename = filename + '.js';
  }

  // Normalize remotes: can be string URL or RemoteConfig object
  const remotes: Record<
    string,
    string | { entry: string; shareScope?: string }
  > = {};
  if (config.remotes) {
    for (const [key, value] of Object.entries(config.remotes)) {
      if (typeof value === 'string') {
        remotes[key] = value;
      } else if (value && typeof value === 'object') {
        const entry = Array.isArray(value.external)
          ? value.external[0]
          : value.external;
        remotes[key] = {
          entry,
          shareScope: value.shareScope,
        };
      }
    }
  }

  return {
    name: config.name ?? '',
    filename,
    exposes: config.exposes ?? {},
    remotes,
    shared: normalizeShared(config, skip),
    shareScope: config.shareScope,
    shareStrategy: config.shareStrategy,
    runtimePlugins: config.runtimePlugins,
    publicPath: config.publicPath,
  };
}

function normalizeShared(
  config: FederationConfig,
  skip: PreparedSkipList,
): Record<string, SharedConfig> {
  let result: Record<string, SharedConfig> = {};
  const shared = config.shared;
  if (!shared) {
    result = shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    }) as Record<string, SharedConfig>;
  } else {
    result = Object.keys(shared).reduce(
      (acc, cur) => {
        return {
          ...acc,
          [cur]: {
            requiredVersion: shared[cur].requiredVersion ?? 'auto',
            singleton: shared[cur].singleton ?? false,
            strictVersion: shared[cur].strictVersion ?? false,
            version: shared[cur].version,
            eager: shared[cur].eager,
            includeSecondaries: shared[cur].includeSecondaries,
            import: shared[cur].import,
            shareKey: shared[cur].shareKey,
            shareScope: shared[cur].shareScope,
            packageName: shared[cur].packageName,
          },
        };
      },
      {} as Record<string, SharedConfig>,
    );
  }
  result = Object.keys(result)
    .filter((key) => !isInSkipList(key, skip))
    .reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: result[cur],
      }),
      {} as Record<string, SharedConfig>,
    );

  return result;
}
