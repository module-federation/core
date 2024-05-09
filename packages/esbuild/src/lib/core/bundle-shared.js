'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.bundleShared = void 0;
const tslib_1 = require('tslib');
const path = tslib_1.__importStar(require('path'));
const fs = tslib_1.__importStar(require('fs'));
const build_utils_1 = require('../utils/build-utils');
const package_info_1 = require('../utils/package-info');
const copy_src_map_if_exists_1 = require('../utils/copy-src-map-if-exists');
const logger_1 = require('../utils/logger');
const normalize_1 = require('../utils/normalize');
function bundleShared(config, fedOptions, externals) {
  return tslib_1.__awaiter(this, void 0, void 0, function* () {
    const folder = fedOptions.packageJson
      ? path.dirname(fedOptions.packageJson)
      : fedOptions.workspaceRoot;
    const cachePath = path.join(
      fedOptions.workspaceRoot,
      'node_modules/.cache/native-federation',
    );
    fs.mkdirSync(cachePath, { recursive: true });
    const packageInfos = Object.keys(config.shared)
      // .filter((packageName) => !isInSkipList(packageName, PREPARED_DEFAULT_SKIP_LIST))
      .map((packageName) =>
        (0, package_info_1.getPackageInfo)(packageName, folder),
      )
      .filter((pi) => !!pi);
    const allEntryPoints = packageInfos.map((pi) => {
      const encName = pi.packageName.replace(/[^A-Za-z0-9]/g, '_');
      const encVersion = pi.version.replace(/[^A-Za-z0-9]/g, '_');
      const outName = fedOptions.dev
        ? `${encName}-${encVersion}-dev.js`
        : `${encName}-${encVersion}.js`;
      return { fileName: pi.entryPoint, outName };
    });
    const fullOutputPath = path.join(
      fedOptions.workspaceRoot,
      fedOptions.outputPath,
    );
    const exptedResults = allEntryPoints.map((ep) =>
      path.join(fullOutputPath, ep.outName),
    );
    const entryPoints = allEntryPoints.filter(
      (ep) => !fs.existsSync(path.join(cachePath, ep.outName)),
    );
    if (entryPoints.length > 0) {
      logger_1.logger.info('Preparing shared npm packages');
      logger_1.logger.notice(
        'This only needs to be done once, as results are cached',
      );
      logger_1.logger.notice(
        "Skip packages you don't want to share in your federation config",
      );
    }
    try {
      yield (0, build_utils_1.bundle)({
        entryPoints,
        tsConfigPath: fedOptions.tsConfig,
        external: externals,
        outdir: cachePath,
        mappedPaths: config.sharedMappings,
        dev: fedOptions.dev,
        kind: 'shared-package',
        hash: false,
      });
      for (const fileName of exptedResults) {
        const outFileName = path.basename(fileName);
        const cachedFile = path.join(cachePath, outFileName);
        copyFileIfExists(cachedFile, fileName);
        (0, copy_src_map_if_exists_1.copySrcMapIfExists)(cachedFile, fileName);
      }
    } catch (e) {
      logger_1.logger.error('Error bundling shared npm package ');
      if (e instanceof Error) {
        logger_1.logger.error(e.message);
      }
      logger_1.logger.error('For more information, run in verbose mode');
      logger_1.logger.notice('');
      logger_1.logger.notice('');
      logger_1.logger.notice('** Important Information: ***');
      logger_1.logger.notice(
        'The error message above shows an issue with bundling a node_module.',
      );
      logger_1.logger.notice(
        'In most cases this is because you (indirectly) shared a Node.js package,',
      );
      logger_1.logger.notice('while Native Federation builds for the browser.');
      logger_1.logger.notice(
        'You can move such packages into devDependencies or skip them in your federation.config.js.',
      );
      logger_1.logger.notice('');
      logger_1.logger.notice('More Details: https://bit.ly/nf-issue');
      logger_1.logger.notice('');
      logger_1.logger.notice('');
      logger_1.logger.verbose(e);
    }
    const outFileNames = [...exptedResults];
    return packageInfos.map((pi) => {
      const shared = config.shared[pi.packageName];
      return {
        packageName: pi.packageName,
        outFileName: path.basename(outFileNames.shift() || ''),
        requiredVersion: shared.requiredVersion,
        singleton: shared.singleton,
        strictVersion: shared.strictVersion,
        version: pi.version,
        dev: !fedOptions.dev
          ? undefined
          : {
              entryPoint: (0, normalize_1.normalize)(pi.entryPoint),
            },
      };
    });
  });
}
exports.bundleShared = bundleShared;
function copyFileIfExists(cachedFile, fullOutputPath) {
  fs.mkdirSync(path.dirname(fullOutputPath), { recursive: true });
  if (fs.existsSync(cachedFile)) {
    fs.copyFileSync(cachedFile, fullOutputPath);
  }
}
//# sourceMappingURL=bundle-shared.js.map
