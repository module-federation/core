import path from 'node:path';
import type { Module, ReadOnlyGraph, SerializerOptions } from 'metro';
import type { SerializerConfigT } from 'metro-config';
import type { ModuleFederationConfigNormalized, ShareObject } from '../types';
import { ConfigError } from '../utils/errors';
import {
  CountingSet,
  baseJSBundle,
  bundleToString,
} from '../utils/metro-compat';

type CustomSerializer = SerializerConfigT['customSerializer'];

export function getModuleFederationSerializer(
  mfConfig: ModuleFederationConfigNormalized,
  isUsingMFBundleCommand: boolean,
): CustomSerializer {
  return async (entryPoint, preModules, graph, options) => {
    const syncRemoteModules = collectSyncRemoteModules(graph, mfConfig.remotes);
    const syncSharedModules = collectSyncSharedModules(graph, mfConfig.shared);
    // main entrypoints always have runModule set to true
    if (options.runModule === true) {
      const finalPreModules = [
        getEarlyShared(syncSharedModules),
        getEarlyRemotes(syncRemoteModules),
        ...preModules,
      ];
      return getBundleCode(entryPoint, finalPreModules, graph, options);
    }

    // skip non-project source like node_modules
    // this includes handling of shared modules!
    if (!isProjectSource(entryPoint, options.projectRoot)) {
      return getBundleCode(entryPoint, preModules, graph, options);
    }

    const bundlePath = getBundlePath(
      entryPoint,
      options.projectRoot,
      mfConfig.exposes,
      isUsingMFBundleCommand,
    );
    const finalPreModules = [
      getSyncShared(syncSharedModules, bundlePath, mfConfig.name),
      getSyncRemotes(syncRemoteModules, bundlePath, mfConfig.name),
    ];

    // include the original preModules if not in modulesOnly mode
    if (options.modulesOnly === false) {
      finalPreModules.push(...preModules);
    }

    // prevent resetting preModules in metro/src/DeltaBundler/Serializers/baseJSBundle.js
    const finalOptions = { ...options, modulesOnly: false };
    return getBundleCode(entryPoint, finalPreModules, graph, finalOptions);
  };
}

function collectSyncRemoteModules(
  graph: ReadOnlyGraph,
  _remotes: Record<string, string>,
) {
  const remotes = new Set(Object.keys(_remotes));
  const syncRemoteModules = new Set<string>();
  for (const [, module] of graph.dependencies) {
    for (const dependency of module.dependencies.values()) {
      // null means it's a sync dependency
      if (dependency.data.data.asyncType !== null) {
        continue;
      }
      // remotes always follow format of <remoteName>/<exposedModule>
      const remoteCandidate = dependency.data.name.split('/')[0];
      const isValidCandidate =
        remoteCandidate.length < dependency.data.name.length;
      if (isValidCandidate && remotes.has(remoteCandidate)) {
        syncRemoteModules.add(dependency.data.name);
      }
    }
  }
  return Array.from(syncRemoteModules);
}

function collectSyncSharedModules(graph: ReadOnlyGraph, _shared: ShareObject) {
  const sharedImports = new Set(
    Object.keys(_shared).map((sharedName) => {
      return _shared[sharedName].import || sharedName;
    }),
  );
  // always include `react` and `react-native`
  const syncSharedModules = new Set<string>(['react', 'react-native']);
  for (const [, module] of graph.dependencies) {
    for (const dependency of module.dependencies.values()) {
      // null means it's a sync dependency
      if (dependency.data.data.asyncType !== null) {
        continue;
      }
      if (module.path.endsWith('init-host.js')) {
        continue;
      }
      if (sharedImports.has(dependency.data.name)) {
        syncSharedModules.add(dependency.data.name);
      }
    }
  }
  return Array.from(syncSharedModules);
}

function getFederationSharedDependenciesNamespace(scope: string) {
  return `globalThis.__FEDERATION__.__NATIVE__["${scope}"].deps.shared`;
}

function getFederationRemotesDependenciesNamespace(scope: string) {
  return `globalThis.__FEDERATION__.__NATIVE__["${scope}"].deps.remotes`;
}

function getSyncShared(shared: string[], entry: string, scope: string): Module {
  const namespace = getFederationSharedDependenciesNamespace(scope);
  const code = `${namespace}["${entry}"]=${JSON.stringify(shared)};`;
  return generateVirtualModule('__required_shared__', code);
}

function getSyncRemotes(
  remotes: string[],
  entry: string,
  scope: string,
): Module {
  const namespace = getFederationRemotesDependenciesNamespace(scope);
  const code = `${namespace}["${entry}"]=${JSON.stringify(remotes)};`;
  return generateVirtualModule('__required_remotes__', code);
}

function getEarlyShared(shared: string[]): Module {
  const code = `var __EARLY_SHARED__=${JSON.stringify(shared)};`;
  return generateVirtualModule('__early_shared__', code);
}

function getEarlyRemotes(remotes: string[]): Module {
  const code = `var __EARLY_REMOTES__=${JSON.stringify(remotes)};`;
  return generateVirtualModule('__early_remotes__', code);
}

function generateVirtualModule(name: string, code: string): Module {
  return {
    dependencies: new Map(),
    getSource: (): Buffer => Buffer.from(code),
    inverseDependencies: new CountingSet<string>(),
    path: name,
    output: [
      {
        type: 'js/script/virtual',
        data: {
          code,
          // @ts-ignore
          lineCount: 1,
          map: [],
        },
      },
    ],
  };
}

function isProjectSource(entryPoint: string, projectRoot: string) {
  const relativePath = path.relative(projectRoot, entryPoint);
  return (
    !relativePath.startsWith('..') && !relativePath.startsWith('node_modules')
  );
}

function getBundlePath(
  entryPoint: string,
  projectRoot: string,
  exposes: ModuleFederationConfigNormalized['exposes'],
  isUsingMFBundleCommand: boolean,
) {
  const relativeEntryPath = path.relative(projectRoot, entryPoint);
  if (!isUsingMFBundleCommand) {
    const { dir, name } = path.parse(relativeEntryPath);
    return path.format({ dir, name, ext: '' });
  }

  // try to match with an exposed module first
  const exposedMatchedKey = Object.keys(exposes).find((exposeKey) =>
    exposes[exposeKey].match(relativeEntryPath),
  );

  if (exposedMatchedKey) {
    // handle as exposed module
    let exposedName = exposedMatchedKey;
    // Remove './' prefix
    if (exposedName.startsWith('./')) {
      exposedName = exposedName.slice(2);
    }
    return `exposed/${exposedName}`;
  }

  throw new ConfigError(
    `Unable to handle entry point: ${relativeEntryPath}. ` +
      'Expected to match an entrypoint with one of the exposed keys, but failed. ' +
      'This is most likely a configuration error. ' +
      'If you believe this is not a configuration issue, please report it as a bug. ' +
      `Debug info: entryPoint="${entryPoint}", projectRoot="${projectRoot}", exposesKeys=[${Object.keys(exposes).join(', ')}]`,
  );
}

function getBundleCode(
  entryPoint: string,
  preModules: readonly Module[],
  graph: ReadOnlyGraph,
  options: SerializerOptions,
) {
  const { code } = bundleToString(
    baseJSBundle(entryPoint, preModules, graph, options),
  );
  return code;
}
