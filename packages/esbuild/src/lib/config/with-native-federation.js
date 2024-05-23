import { prepareSkipList } from '../core/default-skip-list';
import { shareAll } from './share-utils';
import { getMappedPaths } from '../utils/mapped-paths';
import { findRootTsConfigJson } from './share-utils';
import { isInSkipList } from '../core/default-skip-list';
import { logger } from '../utils/logger';

export function withFederation(config) {
  const skip = prepareSkipList(config.skip ?? []);
  return {
    name: config.name ?? '',
    filename: config.filename ?? 'remoteEntry',
    exposes: config.exposes ?? {},
    remotes: config.remotes ?? {},
    shared: normalizeShared(config, skip),
    sharedMappings: normalizeSharedMappings(config, skip),
  };
}

function normalizeShared(config, skip) {
  let result = {};
  const shared = config.shared;
  if (!shared) {
    result = shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    });
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

function normalizeSharedMappings(config, skip) {
  const rootTsConfigPath = findRootTsConfigJson();
  const paths = getMappedPaths({
    rootTsConfigPath,
    sharedMappings: config.sharedMappings,
  });
  const result = paths.filter(
    (p) => !isInSkipList(p.key, skip) && !p.key.includes('*'),
  );
  if (paths.find((p) => p.key.includes('*'))) {
    logger.warn('Sharing mapped paths with wildcards (*) not supported');
  }
  return result;
}
