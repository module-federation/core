import fs from 'node:fs';
import path from 'node:path';
import semver from 'semver';

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

  const hasBridgeReact = '@module-federation/bridge-react' in userDependencies;

  let bridgeRouterAlias = {};
  // user install @module-federation/bridge-react package or set bridgeReactRouterDomAlias
  if (hasBridgeReact) {
    // user install react-router-dom package
    const reactRouterDomVersion = userDependencies['react-router-dom'];
    let majorVersion = 0;
    let reactRouterDomPath = '';

    // if react-router-dom version is set, use the version in package.json
    if (reactRouterDomVersion) {
      majorVersion = semver.major(
        semver.coerce(reactRouterDomVersion || '0.0.0') ?? '0.0.0',
      );
      reactRouterDomPath = require.resolve('react-router-dom');
    } else {
      // if react-router-dom version is not set, reslove react-router-dom to get the version
      reactRouterDomPath = require.resolve('react-router-dom');
      const packageJsonPath = path.resolve(
        reactRouterDomPath,
        '../../package.json',
      );
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      majorVersion = parseInt(packageJson.version.split('.')[0]);
    }

    // if react-router-dom path has set alias by user, use the originalAlias
    reactRouterDomPath = originalAlias || reactRouterDomPath;

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
  }
  console.log(
    '<<<<<<<<<<<<< bridgeRouterAlias >>>>>>>>>>>>>',
    bridgeRouterAlias,
  );
  return bridgeRouterAlias;
};
