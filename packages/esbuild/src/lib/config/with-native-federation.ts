import {
  prepareSkipList,
  isInSkipList,
  PreparedSkipList,
} from '../core/default-skip-list';
import { shareAll } from './share-utils';
import { getMappedPaths, MappedPath } from '../utils/mapped-paths';
import { findRootTsConfigJson } from './share-utils';
import { logger } from '../utils/logger';

interface FederationConfig {
  name?: string;
  filename?: string;
  exposes?: Record<string, string>;
  remotes?: Record<string, string>;
  shared?: Record<string, SharedConfig>;
  skip?: string[];
}

interface SharedConfig {
  requiredVersion?: string;
  singleton?: boolean;
  strictVersion?: boolean;
  version?: string;
  includeSecondaries?: boolean;
}

export function withFederation(config: FederationConfig) {
  const skip: PreparedSkipList = prepareSkipList(config.skip ?? []);
  return {
    name: config.name ?? '',
    filename: config.filename ?? 'remoteEntry',
    exposes: config.exposes ?? {},
    remotes: config.remotes ?? {},
    shared: normalizeShared(config, skip),
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
    result = Object.keys(shared).reduce((acc, cur) => {
      return {
        ...acc,
        [cur]: {
          requiredVersion: shared[cur].requiredVersion ?? 'auto',
          singleton: shared[cur].singleton ?? false,
          strictVersion: shared[cur].strictVersion ?? false,
          version: shared[cur].version,
          includeSecondaries: shared[cur].includeSecondaries,
        },
      };
    }, {});
  }
  result = Object.keys(result)
    .filter((key) => !isInSkipList(key, skip))
    .reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: result[cur],
      }),
      {},
    );

  return result;
}

function normalizeSharedMappings(
  config: FederationConfig,
  skip: PreparedSkipList,
): MappedPath[] {
  const rootTsConfigPath = findRootTsConfigJson();
  const paths = getMappedPaths({
    rootTsConfigPath,
  });
  const result = paths.filter(
    (p) => !isInSkipList(p.key, skip) && !p.key.includes('*'),
  );
  if (paths.find((p) => p.key.includes('*'))) {
    logger.warn('Sharing mapped paths with wildcards (*) not supported');
  }
  return result;
}
