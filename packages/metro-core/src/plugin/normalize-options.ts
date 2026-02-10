import fs from 'node:fs';
import path from 'node:path';
import type {
  ModuleFederationConfig,
  ModuleFederationConfigNormalized,
  Shared,
} from '../types';
import { DEFAULT_ENTRY_FILENAME } from './constants';

interface ProjectConfig {
  projectRoot: string;
  tmpDirPath: string;
}

export function normalizeOptions(
  options: ModuleFederationConfig,
  { projectRoot, tmpDirPath }: ProjectConfig,
): ModuleFederationConfigNormalized {
  const shared = getNormalizedShared(options, projectRoot);
  const shareStrategy = getNormalizedShareStrategy(options);
  const plugins = getNormalizedPlugins(options, tmpDirPath);

  return {
    name: options.name,
    filename: options.filename ?? DEFAULT_ENTRY_FILENAME,
    remotes: options.remotes ?? {},
    exposes: options.exposes ?? {},
    shared,
    shareStrategy,
    plugins,
  };
}

function getNormalizedShared(
  options: ModuleFederationConfig,
  projectRoot: string,
): Shared {
  const pkg = getProjectPackageJson(projectRoot);
  const shared = options.shared ?? {};

  // force all shared modules in host to be eager
  if (!options.exposes) {
    for (const sharedName of Object.keys(shared)) {
      shared[sharedName].eager = true;
    }
  }

  // default requiredVersion
  for (const sharedName of Object.keys(shared)) {
    if (!shared[sharedName].requiredVersion) {
      shared[sharedName].requiredVersion =
        pkg.dependencies?.[sharedName] || pkg.devDependencies?.[sharedName];
    }
  }

  // auto-include `react-native/Libraries/Network/RCTNetworking`
  if (!shared['react-native/Libraries/Network/RCTNetworking']) {
    const reactNativeSharedConfig = shared['react-native'];
    // use the same config as `react-native`
    shared['react-native/Libraries/Network/RCTNetworking'] =
      reactNativeSharedConfig;
  }

  return shared;
}

function getNormalizedShareStrategy(options: ModuleFederationConfig) {
  // this is different from the default share strategy in mf-core
  // it makes more sense to have loaded-first as default on mobile
  // in order to avoid longer TTI upon app startup
  return options.shareStrategy ?? 'loaded-first';
}

function getNormalizedPlugins(
  options: ModuleFederationConfig,
  tmpDirPath: string,
) {
  const plugins = options.plugins ?? [];
  // auto-inject 'metro-core-plugin' runtime plugin.
  // Copy it into the app tmp dir so Metro resolves it inside project roots.
  const metroCorePluginPath = require.resolve('../modules/metroCorePlugin.ts');
  const metroCorePluginTmpPath = path.join(tmpDirPath, 'metroCorePlugin.ts');
  fs.copyFileSync(metroCorePluginPath, metroCorePluginTmpPath);
  plugins.unshift(metroCorePluginTmpPath);
  // make paths relative to the tmp dir
  return plugins.map((pluginPath) => {
    const relativePath = path.relative(tmpDirPath, pluginPath);
    const normalizedPath = relativePath.split(path.sep).join('/');
    return normalizedPath.startsWith('.')
      ? normalizedPath
      : `./${normalizedPath}`;
  });
}

function getProjectPackageJson(projectRoot: string): {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
} {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
}
