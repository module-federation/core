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

export const getBridgeRouterAlias = (
  originalAlias: string,
): Record<string, string> => {
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

  let bridgeRouterAlias = {};
  let majorVersion = 0;
  let reactRouterDomPath = '';

  const reactRouterDomVersion = userDependencies['react-router-dom'];

  if (originalAlias) {
    reactRouterDomPath = originalAlias;
  } else if (reactRouterDomVersion) {
    majorVersion = checkVersion(reactRouterDomVersion);
    reactRouterDomPath = require.resolve('react-router-dom');
  } else {
    reactRouterDomPath = require.resolve('react-router-dom');
  }

  const packageJsonPath = findPackageJson(reactRouterDomPath);

  if (packageJsonPath) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    majorVersion = checkVersion(packageJson.version);
  } else {
    console.warn('Unable to find package.json for react-router-dom');
  }

  if (majorVersion === 5) {
    bridgeRouterAlias = {
      'react-router-dom$':
        '@module-federation/bridge-react/dist/router-v5.es.js',
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
      'react-router-dom$':
        '@module-federation/bridge-react/dist/router-v6.es.js',
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
  } else {
    console.warn('react-router-dom version is not supported');
  }

  console.log(
    '<<<<<<<<<<<<< bridgeRouterAlias >>>>>>>>>>>>>',
    bridgeRouterAlias,
  );
  return bridgeRouterAlias;
};
