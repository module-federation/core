'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.withNativeFederation = void 0;
const mapped_paths_1 = require('../utils/mapped-paths');
const share_utils_1 = require('./share-utils');
const default_skip_list_1 = require('../core/default-skip-list');
const logger_1 = require('../utils/logger');
function withNativeFederation(config) {
  var _a, _b, _c;
  const skip = (0, default_skip_list_1.prepareSkipList)(
    (_a = config.skip) !== null && _a !== void 0 ? _a : [],
  );
  return {
    name: (_b = config.name) !== null && _b !== void 0 ? _b : '',
    exposes: (_c = config.exposes) !== null && _c !== void 0 ? _c : {},
    shared: normalizeShared(config, skip),
    sharedMappings: normalizeSharedMappings(config, skip),
  };
}
exports.withNativeFederation = withNativeFederation;
function normalizeShared(config, skip) {
  let result = {};
  const shared = config.shared;
  if (!shared) {
    result = (0, share_utils_1.shareAll)({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    });
  } else {
    result = Object.keys(shared).reduce((acc, cur) => {
      var _a, _b, _c;
      return Object.assign(Object.assign({}, acc), {
        [cur]: {
          requiredVersion:
            (_a = shared[cur].requiredVersion) !== null && _a !== void 0
              ? _a
              : 'auto',
          singleton:
            (_b = shared[cur].singleton) !== null && _b !== void 0 ? _b : false,
          strictVersion:
            (_c = shared[cur].strictVersion) !== null && _c !== void 0
              ? _c
              : false,
          version: shared[cur].version,
          includeSecondaries: shared[cur].includeSecondaries,
        },
      });
    }, {});
    //result = share(result) as Record<string, NormalizedSharedConfig>;
  }
  result = Object.keys(result)
    .filter((key) => !(0, default_skip_list_1.isInSkipList)(key, skip))
    .reduce(
      (acc, cur) =>
        Object.assign(Object.assign({}, acc), { [cur]: result[cur] }),
      {},
    );
  return result;
}
function normalizeSharedMappings(config, skip) {
  const rootTsConfigPath = (0, share_utils_1.findRootTsConfigJson)();
  const paths = (0, mapped_paths_1.getMappedPaths)({
    rootTsConfigPath,
    sharedMappings: config.sharedMappings,
  });
  const result = paths.filter(
    (p) =>
      !(0, default_skip_list_1.isInSkipList)(p.key, skip) &&
      !p.key.includes('*'),
  );
  if (paths.find((p) => p.key.includes('*'))) {
    logger_1.logger.warn(
      'Sharing mapped paths with wildcards (*) not supported',
    );
  }
  return result;
}
//# sourceMappingURL=with-native-federation.js.map
