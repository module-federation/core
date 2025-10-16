import fs from 'node:fs';
import path from 'node:path';
import { checkVersion, findPackageJson, getDependencies } from './utils';

const reactRouterDomV5AliasPath =
  '@module-federation/bridge-react/dist/router-v5.es.js';
const reactRouterDomV6AliasPath =
  '@module-federation/bridge-react/dist/router-v6.es.js';
const reactRouterDomV7AliasPath =
  '@module-federation/bridge-react/dist/router-v7.es.js';

const createReactRouterV7Alias = (
  reactRouterDomPath: string,
): Record<string, string> => {
  const baseAlias = {
    'react-router$': reactRouterDomV7AliasPath,
    'react-router-dom$': reactRouterDomV7AliasPath, // Keep compatibility for old imports
  };

  const resolvedDistPaths: Record<string, string> = {
    'react-router/dist/development/index.js': reactRouterDomPath,
    'react-router/dist/production/index.js': reactRouterDomPath,
  };

  const legacyCompatibility: Record<string, string> = {
    'react-router-dom/dist/index.js': reactRouterDomPath,
  };

  return {
    ...baseAlias,
    ...resolvedDistPaths,
    ...legacyCompatibility,
  };
};

const createReactRouterV5Alias = (
  reactRouterDomPath: string,
): Record<string, string> => {
  return {
    'react-router-dom$': reactRouterDomV5AliasPath,
    'react-router-dom/index.js': reactRouterDomPath,
  };
};

const createReactRouterV6Alias = (
  reactRouterDomPath: string,
): Record<string, string> => {
  return {
    'react-router-dom$': reactRouterDomV6AliasPath,
    'react-router-dom/dist/index.js': reactRouterDomPath,
  };
};

const setRouterAlias = (
  majorVersion: number,
  reactRouterDomPath: string,
): Record<string, string> => {
  switch (majorVersion) {
    case 5:
      return createReactRouterV5Alias(reactRouterDomPath);
    case 6:
      return createReactRouterV6Alias(reactRouterDomPath);
    case 7:
      return createReactRouterV7Alias(reactRouterDomPath);
    default:
      console.warn(
        `Unsupported React Router version: ${majorVersion}. Defaulting to v7.`,
      );
      return createReactRouterV7Alias(reactRouterDomPath);
  }
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
    reactRouterDomPath = path.resolve(
      process.cwd(),
      'node_modules/react-router',
    );
  } else if (userDependencies['react-router-dom']) {
    // React Router v5/v6 uses 'react-router-dom' package name
    reactRouterDomPath = path.resolve(
      process.cwd(),
      'node_modules/react-router-dom',
    );
  }

  // Generate alias based on detected router package
  if (reactRouterDomPath) {
    const packageJsonPath = findPackageJson(reactRouterDomPath);
    if (packageJsonPath) {
      const packageJsonContent = JSON.parse(
        fs.readFileSync(packageJsonPath, 'utf-8'),
      );
      const majorVersion = checkVersion(packageJsonContent.version);
      const bridgeRouterAlias = setRouterAlias(
        majorVersion,
        reactRouterDomPath,
      );
      console.log(
        '<<<<<<<<<<<<< bridgeRouterAlias >>>>>>>>>>>>>',
        bridgeRouterAlias,
      );
      return bridgeRouterAlias;
    }
  }

  // Default to v6 which uses 'react-router-dom'
  const bridgeRouterAlias = {
    'react-router-dom$': reactRouterDomV6AliasPath,
  };
  console.log(
    '<<<<<<<<<<<<< default bridgeRouterAlias >>>>>>>>>>>>>',
    bridgeRouterAlias,
  );
  return bridgeRouterAlias;
};
