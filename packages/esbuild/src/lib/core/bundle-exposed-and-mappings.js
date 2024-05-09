'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.describeSharedMappings =
  exports.describeExposed =
  exports.bundleExposedAndMappings =
    void 0;
const tslib_1 = require('tslib');
const path_1 = tslib_1.__importDefault(require('path'));
const build_utils_1 = require('../utils/build-utils');
const build_result_map_1 = require('../utils/build-result-map');
const logger_1 = require('../utils/logger');
const normalize_1 = require('../utils/normalize');
function bundleExposedAndMappings(config, fedOptions, externals) {
  return tslib_1.__awaiter(this, void 0, void 0, function* () {
    const shared = config.sharedMappings.map((sm) => {
      const entryPoint = sm.path;
      const tmp = sm.key.replace(/[^A-Za-z0-9]/g, '_');
      const outFilePath = tmp + '.js';
      return { fileName: entryPoint, outName: outFilePath, key: sm.key };
    });
    const exposes = Object.keys(config.exposes).map((key) => {
      const entryPoint = config.exposes[key];
      const outFilePath = key + '.js';
      return { fileName: entryPoint, outName: outFilePath, key };
    });
    const entryPoints = [...shared, ...exposes];
    const hash = !fedOptions.dev;
    logger_1.logger.info('Building federation artefacts');
    const result = yield (0, build_utils_1.bundle)({
      entryPoints,
      outdir: fedOptions.outputPath,
      tsConfigPath: fedOptions.tsConfig,
      external: externals,
      dev: !!fedOptions.dev,
      watch: fedOptions.watch,
      mappedPaths: config.sharedMappings,
      kind: 'mapping-or-exposed',
      hash,
    });
    const resultMap = (0, build_result_map_1.createBuildResultMap)(
      result,
      hash,
    );
    const sharedResult = [];
    for (const item of shared) {
      sharedResult.push({
        packageName: item.key,
        outFileName: (0, build_result_map_1.lookupInResultMap)(
          resultMap,
          item.outName,
        ),
        requiredVersion: '',
        singleton: true,
        strictVersion: false,
        version: '',
        dev: !fedOptions.dev
          ? undefined
          : {
              entryPoint: (0, normalize_1.normalize)(
                path_1.default.normalize(item.fileName),
              ),
            },
      });
    }
    const exposedResult = [];
    for (const item of exposes) {
      exposedResult.push({
        key: item.key,
        outFileName: (0, build_result_map_1.lookupInResultMap)(
          resultMap,
          item.outName,
        ),
        dev: !fedOptions.dev
          ? undefined
          : {
              entryPoint: (0, normalize_1.normalize)(
                path_1.default.join(fedOptions.workspaceRoot, item.fileName),
              ),
            },
      });
    }
    return { mappings: sharedResult, exposes: exposedResult };
  });
}
exports.bundleExposedAndMappings = bundleExposedAndMappings;
function describeExposed(config, options) {
  const result = [];
  for (const key in config.exposes) {
    const localPath = (0, normalize_1.normalize)(
      path_1.default.normalize(
        path_1.default.join(options.workspaceRoot, config.exposes[key]),
      ),
    );
    result.push({
      key,
      outFileName: '',
      dev: !options.dev
        ? undefined
        : {
            entryPoint: localPath,
          },
    });
  }
  return result;
}
exports.describeExposed = describeExposed;
function describeSharedMappings(config, fedOptions) {
  const result = [];
  for (const m of config.sharedMappings) {
    result.push({
      packageName: m.key,
      outFileName: '',
      requiredVersion: '',
      singleton: true,
      strictVersion: false,
      version: '',
      dev: !fedOptions.dev
        ? undefined
        : {
            entryPoint: (0, normalize_1.normalize)(
              path_1.default.normalize(m.path),
            ),
          },
    });
  }
  return result;
}
exports.describeSharedMappings = describeSharedMappings;
//# sourceMappingURL=bundle-exposed-and-mappings.js.map
