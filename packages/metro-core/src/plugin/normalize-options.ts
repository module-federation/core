import fs from 'node:fs';
import path from 'node:path';
import type {
  ModuleFederationConfig,
  ModuleFederationConfigNormalized,
  ShareObject,
} from '../types';
import { DEFAULT_ENTRY_FILENAME } from './constants';
import { toPosixPath } from './helpers';

interface ProjectConfig {
  projectRoot: string;
  tmpDirPath: string;
}

export function normalizeOptions(
  options: ModuleFederationConfig,
  { projectRoot, tmpDirPath }: ProjectConfig,
): ModuleFederationConfigNormalized {
  const shared = getNormalizedShared(options, projectRoot);
  const remotes = getNormalizedRemotes(options);
  const exposes = getNormalizedExposes(options);
  const shareStrategy = getNormalizedShareStrategy(options);
  const plugins = getNormalizedPlugins(options, tmpDirPath);

  return {
    // validated in validateOptions before normalization
    name: options.name as string,
    filename: options.filename ?? DEFAULT_ENTRY_FILENAME,
    remotes,
    exposes,
    shared,
    shareStrategy,
    plugins,
    dts: options.dts ?? false,
  };
}

function getNormalizedRemotes(
  options: ModuleFederationConfig,
): Record<string, string> {
  return { ...((options.remotes ?? {}) as Record<string, string>) };
}

function getNormalizedExposes(
  options: ModuleFederationConfig,
): Record<string, string> {
  return { ...((options.exposes ?? {}) as Record<string, string>) };
}

function getNormalizedShared(
  options: ModuleFederationConfig,
  projectRoot: string,
): ShareObject {
  const pkg = getProjectPackageJson(projectRoot);
  const sharedInput = options.shared ?? {};
  const shared = Object.entries(sharedInput).reduce(
    (acc, [sharedName, config]) => {
      if (typeof config === 'string') {
        return acc;
      }

      const metroSharedConfig = {
        ...(config as ShareObject[string]),
      };
      acc[sharedName] = metroSharedConfig;
      return acc;
    },
    {} as ShareObject,
  );

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
  const runtimePlugins = getNormalizedRuntimePlugins(options);
  const plugins = options.plugins ?? [];

  // auto-inject 'metro-core-plugin' runtime plugin
  const allPlugins = [
    require.resolve('../modules/metroCorePlugin.ts'),
    ...runtimePlugins,
    ...plugins,
  ];

  const deduplicatedPlugins = Array.from(new Set(allPlugins));

  // make paths relative to the tmp dir
  return deduplicatedPlugins.map((pluginPath) =>
    toPosixPath(path.relative(tmpDirPath, pluginPath)),
  );
}

function getNormalizedRuntimePlugins(
  options: ModuleFederationConfig,
): string[] {
  const runtimePlugins = options.runtimePlugins ?? [];
  const normalizedRuntimePlugins: string[] = [];

  runtimePlugins.forEach((runtimePlugin) => {
    if (typeof runtimePlugin === 'string') {
      normalizedRuntimePlugins.push(runtimePlugin);
      return;
    }

    if (Array.isArray(runtimePlugin)) {
      const [pluginPath] = runtimePlugin;
      if (typeof pluginPath === 'string') {
        normalizedRuntimePlugins.push(pluginPath);
      }
    }
  });

  return normalizedRuntimePlugins;
}

function getProjectPackageJson(projectRoot: string): {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
} {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
}
