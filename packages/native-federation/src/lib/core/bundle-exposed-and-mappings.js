const path = require('path');
const { bundle } = require('../utils/build-utils');
const {
  createBuildResultMap,
  lookupInResultMap,
} = require('../utils/build-result-map');
const { logger } = require('../utils/logger');
const { normalize } = require('../utils/normalize');

async function bundleExposedAndMappings(config, fedOptions, externals) {
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
  logger.info('Building federation artefacts');
  const result = await bundle({
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
  const resultMap = createBuildResultMap(result, hash);
  const sharedResult = [];
  for (const item of shared) {
    sharedResult.push({
      packageName: item.key,
      outFileName: lookupInResultMap(resultMap, item.outName),
      requiredVersion: '',
      singleton: true,
      strictVersion: false,
      version: '',
      dev: !fedOptions.dev
        ? undefined
        : {
            entryPoint: normalize(path.normalize(item.fileName)),
          },
    });
  }
  const exposedResult = [];
  for (const item of exposes) {
    exposedResult.push({
      key: item.key,
      outFileName: lookupInResultMap(resultMap, item.outName),
      dev: !fedOptions.dev
        ? undefined
        : {
            entryPoint: normalize(
              path.join(fedOptions.workspaceRoot, item.fileName),
            ),
          },
    });
  }
  return { mappings: sharedResult, exposes: exposedResult };
}

function describeExposed(config, options) {
  const result = [];
  for (const key in config.exposes) {
    const localPath = normalize(
      path.normalize(path.join(options.workspaceRoot, config.exposes[key])),
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
            entryPoint: normalize(path.normalize(m.path)),
          },
    });
  }
  return result;
}
module.exports = {
  bundleExposedAndMappings,
  describeExposed,
  describeSharedMappings,
};
//# sourceMappingURL=bundle-exposed-and-mappings.js.map
