const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');
const { normalize } = require('./normalize');

const packageCache = {};

function findPackageJsonFiles(project, workspace) {
  return expandFolders(project, workspace)
    .map((f) => path.join(f, 'package.json'))
    .filter((f) => fs.existsSync(f));
}

function expandFolders(child, parent) {
  const result = [];
  parent = normalize(parent, true);
  child = normalize(child, true);
  if (!child.startsWith(parent)) {
    throw new Error(
      `Workspace folder ${path} needs to be a parent of the project folder ${child}`,
    );
  }
  let current = child;
  while (current !== parent) {
    result.push(current);
    const cand = normalize(path.dirname(current), true);
    if (cand === current) {
      break;
    }
    current = cand;
  }
  result.push(parent);
  return result;
}

function getPackageInfo(packageName, workspaceRoot) {
  workspaceRoot = normalize(workspaceRoot, true);
  const packageJsonInfos = getPackageJsonFiles(workspaceRoot, workspaceRoot);
  for (const info of packageJsonInfos) {
    const cand = _getPackageInfo(packageName, info.directory);
    if (cand) {
      return cand;
    }
  }
  logger.warn('No meta data found for shared lib ' + packageName);
  return null;
}

function getVersionMapCacheKey(project, workspace) {
  return `${project}**${workspace}`;
}

function getVersionMaps(project, workspace) {
  return getPackageJsonFiles(project, workspace).map((json) => ({
    ...json.content['dependencies'],
  }));
}

function getPackageJsonFiles(project, workspace) {
  const cacheKey = getVersionMapCacheKey(project, workspace);
  let maps = packageCache[cacheKey];
  if (maps) {
    return maps;
  }
  maps = findPackageJsonFiles(project, workspace).map((f) => {
    const content = JSON.parse(fs.readFileSync(f, 'utf-8'));
    const directory = normalize(path.dirname(f), true);
    const result = {
      content,
      directory,
    };
    return result;
  });
  packageCache[cacheKey] = maps;
  return maps;
}

function findDepPackageJson(packageName, projectRoot) {
  const mainPkgName = getPkgFolder(packageName);
  let mainPkgPath = path.join(projectRoot, 'node_modules', mainPkgName);
  let mainPkgJsonPath = path.join(mainPkgPath, 'package.json');
  let directory = projectRoot;
  while (path.dirname(directory) !== directory) {
    if (fs.existsSync(mainPkgJsonPath)) {
      break;
    }
    directory = normalize(path.dirname(directory), true);
    mainPkgPath = path.join(directory, 'node_modules', mainPkgName);
    mainPkgJsonPath = path.join(mainPkgPath, 'package.json');
  }
  if (!fs.existsSync(mainPkgJsonPath)) {
    logger.verbose(
      'No package.json found for ' + packageName + ' in ' + mainPkgPath,
    );
    return null;
  }
  return mainPkgJsonPath;
}

function _getPackageInfo(packageName, directory) {
  const mainPkgName = getPkgFolder(packageName);
  const mainPkgJsonPath = findDepPackageJson(packageName, directory);
  if (!mainPkgJsonPath) {
    return null;
  }
  const mainPkgPath = path.dirname(mainPkgJsonPath);
  const mainPkgJson = readJson(mainPkgJsonPath);
  const version = mainPkgJson['version'];
  const esm = mainPkgJson['type'] === 'module';
  if (!version) {
    logger.warn('No version found for ' + packageName);
    return null;
  }
  let relSecondaryPath = path.relative(mainPkgName, packageName);
  if (!relSecondaryPath) {
    relSecondaryPath = '.';
  } else {
    relSecondaryPath = './' + relSecondaryPath.replace(/\\/g, '/');
  }
  let cand = mainPkgJson?.exports
    ? mainPkgJson.exports[relSecondaryPath]
    : undefined;
  if (typeof cand === 'string') {
    return {
      entryPoint: path.join(mainPkgPath, cand),
      packageName,
      version,
      esm,
    };
  }
  cand = mainPkgJson?.exports
    ? mainPkgJson.exports[relSecondaryPath]?.import
    : undefined;
  if (typeof cand === 'object') {
    if (cand.module) {
      cand = cand.module;
    } else if (cand.import) {
      cand = cand.import;
    } else if (cand.default) {
      cand = cand.default;
    } else {
      cand = null;
    }
  }
  if (cand) {
    return {
      entryPoint: path.join(mainPkgPath, cand),
      packageName,
      version,
      esm,
    };
  }
  cand = mainPkgJson?.exports
    ? mainPkgJson.exports[relSecondaryPath]?.module
    : undefined;
  if (typeof cand === 'object') {
    if (cand.module) {
      cand = cand.module;
    } else if (cand.import) {
      cand = cand.import;
    } else if (cand.default) {
      cand = cand.default;
    } else {
      cand = null;
    }
  }
  if (cand) {
    return {
      entryPoint: path.join(mainPkgPath, cand),
      packageName,
      version,
      esm,
    };
  }
  cand = mainPkgJson?.exports
    ? mainPkgJson.exports[relSecondaryPath]?.default
    : undefined;
  if (cand) {
    if (typeof cand === 'object') {
      if (cand.module) {
        cand = cand.module;
      } else if (cand.import) {
        cand = cand.import;
      } else if (cand.default) {
        cand = cand.default;
      } else {
        cand = null;
      }
    }
    return {
      entryPoint: path.join(mainPkgPath, cand),
      packageName,
      version,
      esm,
    };
  }
  cand = mainPkgJson['module'];
  if (cand && relSecondaryPath === '.') {
    return {
      entryPoint: path.join(mainPkgPath, cand),
      packageName,
      version,
      esm: true,
    };
  }
  const secondaryPgkPath = path.join(mainPkgPath, relSecondaryPath);
  const secondaryPgkJsonPath = path.join(secondaryPgkPath, 'package.json');
  let secondaryPgkJson = null;
  if (fs.existsSync(secondaryPgkJsonPath)) {
    secondaryPgkJson = readJson(secondaryPgkJsonPath);
  }
  if (secondaryPgkJson && secondaryPgkJson.module) {
    return {
      entryPoint: path.join(secondaryPgkPath, secondaryPgkJson.module),
      packageName,
      version,
      esm: true,
    };
  }
  cand = path.join(secondaryPgkPath, 'index.mjs');
  if (fs.existsSync(cand)) {
    return {
      entryPoint: cand,
      packageName,
      version,
      esm: true,
    };
  }
  if (secondaryPgkJson && secondaryPgkJson.main) {
    return {
      entryPoint: path.join(secondaryPgkPath, secondaryPgkJson.main),
      packageName,
      version,
      esm,
    };
  }
  cand = path.join(secondaryPgkPath, 'index.js');
  if (fs.existsSync(cand)) {
    return {
      entryPoint: cand,
      packageName,
      version,
      esm,
    };
  }
  logger.warn('No entry point found for ' + packageName);
  logger.warn(
    "If you don't need this package, skip it in your federation.config.js or consider moving it into depDependencies in your package.json",
  );
  return null;
}

function readJson(mainPkgJsonPath) {
  return JSON.parse(fs.readFileSync(mainPkgJsonPath, 'utf-8'));
}

function getPkgFolder(packageName) {
  const parts = packageName.split('/');
  let folder = parts[0];
  if (folder.startsWith('@')) {
    folder += '/' + parts[1];
  }
  return folder;
}

module.exports = {
  findPackageJsonFiles,
  expandFolders,
  getPackageInfo,
  getVersionMapCacheKey,
  getVersionMaps,
  getPackageJsonFiles,
  findDepPackageJson,
  _getPackageInfo,
  readJson,
  getPkgFolder,
};
// const pkg = process.argv[2]
// console.log('pkg', pkg);
// const r = getPackageInfo('D:/Dokumente/projekte/mf-plugin/angular-architects/', pkg);
// console.log('entry', r);
//# sourceMappingURL=package-info.js.map
