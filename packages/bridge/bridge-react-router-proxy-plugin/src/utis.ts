import fs from 'node:fs';
import path from 'node:path';
import semver from 'semver';

export const checkVersion = (version: string) => {
  // Extract the version number starting from the first digit
  const versionMatch = version.match(/\d.*/);
  if (!versionMatch) return 0;

  const cleanVersion = versionMatch[0];

  if (semver.gte(cleanVersion, '5.0.0') && semver.lt(cleanVersion, '6.0.0')) {
    return 5;
  } else if (semver.gte(cleanVersion, '6.0.0')) {
    return 6;
  }

  return 0;
};

export const findPackageJson = (startPath: string): string | null => {
  let currentPath = startPath;
  while (currentPath !== path.parse(currentPath).root) {
    const packageJsonPath = path.join(currentPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return packageJsonPath;
    }
    currentPath = path.dirname(currentPath);
  }
  return null;
};

const getDependencies = () => {
  const userPackageJsonPath = path.resolve(process.cwd(), 'package.json');
  let userDependencies: Record<string, string> = {};

  if (fs.existsSync(userPackageJsonPath)) {
    const userPackageJson = JSON.parse(
      fs.readFileSync(userPackageJsonPath, 'utf-8'),
    );
    userDependencies = {
      ...userPackageJson.dependencies,
      ...userPackageJson.devDependencies,
    };
  }
  return userDependencies;
};

const reactRouterDomV5AliasPath =
  '@module-federation/bridge-react/dist/router-v5.es.js';
const reactRouterDomV6AliasPath =
  '@module-federation/bridge-react/dist/router-v6.es.js';

const setRouterAlias = (majorVersion: number, reactRouterDomPath: string) => {
  let bridgeRouterAlias = {};
  if (majorVersion === 5) {
    bridgeRouterAlias = {
      'react-router-dom$': reactRouterDomV5AliasPath,
    };
    try {
      require.resolve('react-router-dom/index.js');
    } catch (error) {
      // if react-router-dom/index.js cannot be resolved, set the alias to origin reactRouterDomPath
      bridgeRouterAlias = {
        ...bridgeRouterAlias,
        'react-router-dom/index.js': reactRouterDomPath,
      };
    }
  } else if (majorVersion === 6) {
    bridgeRouterAlias = {
      'react-router-dom$': reactRouterDomV6AliasPath,
    };
    try {
      require.resolve('react-router-dom/dist/index.js');
    } catch (error) {
      // if react-router-dom/dist/index.js cannot be resolved, set the alias to origin reactRouterDomPath
      bridgeRouterAlias = {
        ...bridgeRouterAlias,
        'react-router-dom/dist/index.js': reactRouterDomPath,
      };
    }
  }
  return bridgeRouterAlias;
};

export const getBridgeRouterAlias = (
  originalAlias: string,
): Record<string, string> => {
  const userDependencies = getDependencies();
  let reactRouterDomPath = '';

  if (originalAlias) {
    reactRouterDomPath = originalAlias;
  } else if (userDependencies['react-router-dom']) {
    try {
      reactRouterDomPath = path.resolve(
        process.cwd(),
        'node_modules/react-router-dom',
      );
    } catch (error) {
      console.log(error);
    }
  }

  // if find react-router-dom in package.json
  if (reactRouterDomPath) {
    const packageJsonPath = findPackageJson(reactRouterDomPath) || '';
    const packageJsonContent = JSON.parse(
      fs.readFileSync(packageJsonPath, 'utf-8'),
    );
    const majorVersion = checkVersion(packageJsonContent.version);
    const bridgeRouterAlias = setRouterAlias(majorVersion, reactRouterDomPath);
    console.log(
      '<<<<<<<<<<<<< bridgeRouterAlias >>>>>>>>>>>>>',
      bridgeRouterAlias,
    );
    return bridgeRouterAlias;
  } else {
    const bridgeRouterAlias = {
      'react-router-dom$': reactRouterDomV6AliasPath,
    };
    console.log(
      '<<<<<<<<<<<<< default bridgeRouterAlias >>>>>>>>>>>>>',
      bridgeRouterAlias,
    );
    return bridgeRouterAlias;
  }
};
