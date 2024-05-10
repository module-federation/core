const path = require('path');
const fs = require('fs');
const { bundle } = require('../utils/build-utils.js');
const { getPackageInfo } = require('../utils/package-info.js');
const { copySrcMapIfExists } = require('../utils/copy-src-map-if-exists.js');
const { logger } = require('../utils/logger.js');
const { normalize } = require('../utils/normalize.js');

async function bundleShared(config, fedOptions, externals) {
  const folder = fedOptions.packageJson
    ? path.dirname(fedOptions.packageJson)
    : fedOptions.workspaceRoot;
  const cachePath = path.join(
    fedOptions.workspaceRoot,
    'node_modules/.cache/native-federation',
  );
  fs.mkdirSync(cachePath, { recursive: true });
  const packageInfos = Object.keys(config.shared)
    .map((packageName) => getPackageInfo(packageName, folder))
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
    logger.info('Preparing shared npm packages');
    logger.notice('This only needs to be done once, as results are cached');
    logger.notice(
      "Skip packages you don't want to share in your federation config",
    );
  }
  try {
    await bundle({
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
      copySrcMapIfExists(cachedFile, fileName);
    }
  } catch (e) {
    logger.error('Error bundling shared npm package ');
    if (e instanceof Error) {
      logger.error(e.message);
    }
    logger.error('For more information, run in verbose mode');
    logger.notice('');
    logger.notice('');
    logger.notice('** Important Information: ***');
    logger.notice(
      'The error message above shows an issue with bundling a node_module.',
    );
    logger.notice(
      'In most cases this is because you (indirectly) shared a Node.js package,',
    );
    logger.notice('while Native Federation builds for the browser.');
    logger.notice(
      'You can move such packages into devDependencies or skip them in your federation.config.js.',
    );
    logger.notice('');
    logger.notice('More Details: https://bit.ly/nf-issue');
    logger.notice('');
    logger.notice('');
    logger.verbose(e);
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
            entryPoint: normalize(pi.entryPoint),
          },
    };
  });
}

function copyFileIfExists(cachedFile, fullOutputPath) {
  fs.mkdirSync(path.dirname(fullOutputPath), { recursive: true });
  if (fs.existsSync(cachedFile)) {
    fs.copyFileSync(cachedFile, fullOutputPath);
  }
}

module.exports = { bundleShared };

//# sourceMappingURL=bundle-shared.js.map
