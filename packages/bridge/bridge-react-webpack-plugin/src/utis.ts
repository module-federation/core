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
  } else if (
    semver.gte(cleanVersion, '6.0.0') &&
    semver.lt(cleanVersion, '7.0.0')
  ) {
    return 6;
  } else if (semver.gte(cleanVersion, '7.0.0')) {
    return 7;
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
const reactRouterDomV7AliasPath =
  '@module-federation/bridge-react/dist/router-v7.es.js';

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
  } else if (majorVersion === 7) {
    // React Router v7 uses 'react-router' package name with new dist structure
    bridgeRouterAlias = {
      'react-router$': reactRouterDomV7AliasPath,
      'react-router-dom$': reactRouterDomV7AliasPath, // Keep compatibility for old imports
    };

    // Try to resolve v7's new dist structure based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const preferredPath = isProduction
      ? 'react-router/dist/production/index.js'
      : 'react-router/dist/development/index.js';
    const fallbackPath = isProduction
      ? 'react-router/dist/development/index.js'
      : 'react-router/dist/production/index.js';

    try {
      require.resolve(preferredPath);
      // Preferred path exists, set alias accordingly
      bridgeRouterAlias = {
        ...bridgeRouterAlias,
        'react-router/dist/development/index.js':
          reactRouterDomPath +
          '/' +
          (isProduction
            ? 'dist/production/index.js'
            : 'dist/development/index.js'),
        'react-router/dist/production/index.js':
          reactRouterDomPath +
          '/' +
          (isProduction
            ? 'dist/production/index.js'
            : 'dist/development/index.js'),
      };
    } catch (error) {
      try {
        require.resolve(fallbackPath);
        // Use fallback path
        const fallbackDistPath = isProduction
          ? 'dist/development/index.js'
          : 'dist/production/index.js';
        bridgeRouterAlias = {
          ...bridgeRouterAlias,
          'react-router/dist/development/index.js':
            reactRouterDomPath + '/' + fallbackDistPath,
          'react-router/dist/production/index.js':
            reactRouterDomPath + '/' + fallbackDistPath,
        };
      } catch (error2) {
        // Ultimate fallback to original path
        bridgeRouterAlias = {
          ...bridgeRouterAlias,
          'react-router/dist/development/index.js': reactRouterDomPath,
          'react-router/dist/production/index.js': reactRouterDomPath,
        };
      }
    }

    // Keep compatibility for old react-router-dom imports
    try {
      require.resolve('react-router-dom/dist/index.js');
    } catch (error) {
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
  } else if (userDependencies['react-router']) {
    // React Router v7 uses 'react-router' package name
    try {
      reactRouterDomPath = path.resolve(
        process.cwd(),
        'node_modules/react-router',
      );
    } catch (error) {
      console.log(error);
    }
  } else if (userDependencies['react-router-dom']) {
    // React Router v5/v6 uses 'react-router-dom' package name
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
    // Default to v7 (latest) which uses 'react-router' package name
    const bridgeRouterAlias = {
      'react-router$': reactRouterDomV7AliasPath,
      'react-router-dom$': reactRouterDomV7AliasPath, // Keep compatibility
    };
    console.log(
      '<<<<<<<<<<<<< default bridgeRouterAlias >>>>>>>>>>>>>',
      bridgeRouterAlias,
    );
    return bridgeRouterAlias;
  }
};
