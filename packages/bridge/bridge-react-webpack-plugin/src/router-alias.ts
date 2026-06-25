import fs from 'node:fs';
import path from 'node:path';
import { checkVersion, findPackageJson, getDependencies } from './utils';

const reactRouterDomV5AliasPath =
  '@module-federation/bridge-react/dist/router-v5.es.js';
const reactRouterDomV6AliasPath =
  '@module-federation/bridge-react/dist/router-v6.es.js';
const reactRouterDomV7AliasPath =
  '@module-federation/bridge-react/dist/router-v7.es.js';
const reactRouterV8AliasPath =
  '@module-federation/bridge-react/dist/router-v8.es.js';
const reactRouterV8DomAliasPath =
  '@module-federation/bridge-react/dist/router-v8-dom.es.js';
const reactRouterRuntimeAlias =
  '@module-federation/bridge-react/router-runtime$';

type BridgeRouterAliasOptions = {
  reactRouterAlias?: string;
  reactRouterDomAlias?: string;
};

const getAliasPackagePath = (alias?: string): string => {
  if (!alias) {
    return '';
  }

  return path.isAbsolute(alias) || alias.startsWith('.') ? alias : '';
};

const getPackageInfo = (
  routerPackagePath: string,
): { majorVersion: number; packagePath: string } | null => {
  const packageJsonPath = findPackageJson(routerPackagePath);
  if (!packageJsonPath) {
    return null;
  }

  const packageJsonContent = JSON.parse(
    fs.readFileSync(packageJsonPath, 'utf-8'),
  );

  return {
    majorVersion: checkVersion(packageJsonContent.version),
    packagePath: path.dirname(packageJsonPath),
  };
};

const createReactRouterV7Alias = (
  routerPackagePath: string,
): Record<string, string> => {
  const baseAlias = {
    'react-router$': reactRouterDomV7AliasPath,
    'react-router-dom$': reactRouterDomV7AliasPath, // Keep compatibility for old imports
    [reactRouterRuntimeAlias]: reactRouterDomV7AliasPath,
  };

  const resolvedDistPaths: Record<string, string> = {
    'react-router/dist/development/index.js': routerPackagePath,
    'react-router/dist/production/index.js': routerPackagePath,
  };

  const legacyCompatibility: Record<string, string> = {
    'react-router-dom/dist/index.js': routerPackagePath,
  };

  return {
    ...baseAlias,
    ...resolvedDistPaths,
    ...legacyCompatibility,
  };
};

const createReactRouterV8Alias = (
  routerPackagePath: string,
): Record<string, string> => {
  return {
    'react-router$': reactRouterV8AliasPath,
    'react-router/dom$': reactRouterV8DomAliasPath,
    [reactRouterRuntimeAlias]: reactRouterV8AliasPath,
    'react-router/dist/development/index.js': routerPackagePath,
    'react-router/dist/production/index.js': routerPackagePath,
    'react-router/dist/development/dom-export.js': path.join(
      routerPackagePath,
      'dist/development/dom-export.js',
    ),
    'react-router/dist/production/dom-export.js': path.join(
      routerPackagePath,
      'dist/production/dom-export.js',
    ),
  };
};

const createReactRouterV5Alias = (
  routerPackagePath: string,
): Record<string, string> => {
  return {
    'react-router-dom$': reactRouterDomV5AliasPath,
    [reactRouterRuntimeAlias]: reactRouterDomV5AliasPath,
    'react-router-dom/index.js': routerPackagePath,
  };
};

const createReactRouterV6Alias = (
  routerPackagePath: string,
): Record<string, string> => {
  return {
    'react-router-dom$': reactRouterDomV6AliasPath,
    [reactRouterRuntimeAlias]: reactRouterDomV6AliasPath,
    'react-router-dom/dist/index.js': routerPackagePath,
  };
};

const setRouterAlias = (
  majorVersion: number,
  routerPackagePath: string,
): Record<string, string> => {
  switch (majorVersion) {
    case 5:
      return createReactRouterV5Alias(routerPackagePath);
    case 6:
      return createReactRouterV6Alias(routerPackagePath);
    case 7:
      return createReactRouterV7Alias(routerPackagePath);
    case 8:
      return createReactRouterV8Alias(routerPackagePath);
    default:
      console.warn(
        `Unsupported React Router version: ${majorVersion}. Defaulting to v7.`,
      );
      return createReactRouterV7Alias(routerPackagePath);
  }
};

const resolveAliasPackagePath = (
  aliasOptions: BridgeRouterAliasOptions,
): string => {
  if (aliasOptions.reactRouterAlias) {
    const reactRouterPackage = getPackageInfo(aliasOptions.reactRouterAlias);

    if (reactRouterPackage && reactRouterPackage.majorVersion >= 7) {
      return reactRouterPackage.packagePath;
    }

    if (reactRouterPackage && reactRouterPackage.majorVersion < 7) {
      return getAliasPackagePath(aliasOptions.reactRouterDomAlias);
    }
  }

  const reactRouterDomAlias = getAliasPackagePath(
    aliasOptions.reactRouterDomAlias,
  );
  if (reactRouterDomAlias) {
    return reactRouterDomAlias;
  }

  return getAliasPackagePath(aliasOptions.reactRouterAlias);
};

const resolveDependencyPackagePath = (
  userDependencies: Record<string, string>,
): string => {
  const reactRouterPath = path.resolve(
    process.cwd(),
    'node_modules/react-router',
  );

  if (userDependencies['react-router']) {
    const reactRouterPackage = getPackageInfo(reactRouterPath);

    if (reactRouterPackage && reactRouterPackage.majorVersion >= 7) {
      return reactRouterPath;
    }
  }

  if (userDependencies['react-router-dom']) {
    return path.resolve(process.cwd(), 'node_modules/react-router-dom');
  }

  if (userDependencies['react-router']) {
    return reactRouterPath;
  }

  return '';
};

export const getBridgeRouterAlias = (
  originalAlias?: string | BridgeRouterAliasOptions,
): Record<string, string> => {
  const aliasOptions =
    typeof originalAlias === 'string'
      ? { reactRouterDomAlias: originalAlias }
      : originalAlias || {};
  const userDependencies = getDependencies();
  const routerPackagePath =
    resolveAliasPackagePath(aliasOptions) ||
    resolveDependencyPackagePath(userDependencies);

  // Generate alias based on detected router package
  if (routerPackagePath) {
    const packageJsonPath = findPackageJson(routerPackagePath);
    if (packageJsonPath) {
      const packageJsonContent = JSON.parse(
        fs.readFileSync(packageJsonPath, 'utf-8'),
      );
      const majorVersion = checkVersion(packageJsonContent.version);
      const bridgeRouterAlias = setRouterAlias(majorVersion, routerPackagePath);
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
    [reactRouterRuntimeAlias]: reactRouterDomV6AliasPath,
  };
  console.log(
    '<<<<<<<<<<<<< default bridgeRouterAlias >>>>>>>>>>>>>',
    bridgeRouterAlias,
  );
  return bridgeRouterAlias;
};

export const shouldGuardSharedReactRouter = (
  originalAlias?: string | BridgeRouterAliasOptions,
): boolean => {
  const aliasOptions =
    typeof originalAlias === 'string'
      ? { reactRouterDomAlias: originalAlias }
      : originalAlias || {};
  const userDependencies = getDependencies();
  const routerPackagePath =
    resolveAliasPackagePath(aliasOptions) ||
    resolveDependencyPackagePath(userDependencies);

  if (!routerPackagePath) {
    return false;
  }

  const packageJsonPath = findPackageJson(routerPackagePath);
  if (!packageJsonPath) {
    return false;
  }

  const packageJsonContent = JSON.parse(
    fs.readFileSync(packageJsonPath, 'utf-8'),
  );

  return checkVersion(packageJsonContent.version) >= 7;
};
