import * as _path from 'path';
import * as fs from 'fs';
import { bundle } from '../utils/build-utils';
import { getPackageInfo } from '../utils/package-info';
import { copySrcMapIfExists } from '../utils/copy-src-map-if-exists';
import { logger } from '../utils/logger';
import { normalize } from '../utils/normalize';

export async function bundleShared(config, fedOptions, externals) {
  const folder = fedOptions.packageJson
    ? _path.dirname(fedOptions.packageJson)
    : fedOptions.workspaceRoot;

  const cachePath = _path.join(
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

  const fullOutputPath = _path.join(
    fedOptions.workspaceRoot,
    fedOptions.outputPath,
  );
  const exptedResults = allEntryPoints.map((ep) =>
    _path.join(fullOutputPath, ep.outName),
  );

  const entryPoints = allEntryPoints.filter(
    (ep) => !fs.existsSync(_path.join(cachePath, ep.outName)),
  );

  if (entryPoints.length > 0) {
    logger.info('Preparing shared npm packages');
    logger.notice('This only needs to be done once, as results are cached');
    logger.notice(
      "Skip packages you don't want to share in your federation config",
    );
  }

  try {
    const build = await bundle({
      entryPoints,
      tsConfigPath: fedOptions.tsConfig,
      external: externals,
      outdir: cachePath,
      mappedPaths: config.sharedMappings,
      dev: fedOptions.dev,
      kind: 'shared-package',
      hash: false,
      packageInfos: packageInfos,
      name: config.name,
    });
    for (const fileName of exptedResults) {
      const outFileName = _path.basename(fileName);
      const cachedFile = _path.join(cachePath, outFileName);

      const realoutFileName = 'mf_' + _path.basename(fileName);
      const realcachedFile = _path.join(cachePath, realoutFileName);

      copyFileIfExists(cachedFile, fileName);
      copySrcMapIfExists(cachedFile, fileName);

      copyFileIfExists(
        realcachedFile,
        fileName.replace(outFileName, realoutFileName),
      );
      copySrcMapIfExists(
        realcachedFile,
        fileName.replace(outFileName, realoutFileName),
      );
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
      outFileName: _path.basename(outFileNames.shift() || ''),
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
  debugger;
  fs.mkdirSync(_path.dirname(fullOutputPath), { recursive: true });
  if (fs.existsSync(cachedFile)) {
    fs.copyFileSync(cachedFile, fullOutputPath);
  }
}
