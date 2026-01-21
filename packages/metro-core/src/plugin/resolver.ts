import path from 'node:path';
import type { CustomResolver, Resolution } from 'metro-resolver';
import type { ModuleFederationConfigNormalized } from '../types';
import type { VirtualModuleManager } from '../utils';
import {
  ASYNC_REQUIRE,
  GET_DEV_SERVER_REGEX,
  HMR_CLIENT_REGEX,
  INIT_HOST,
  REMOTE_HMR_SETUP,
  REMOTE_MODULE_REGISTRY,
} from './constants';
import {
  getHostEntryModule,
  getInitHostModule,
  getRemoteEntryModule,
  getRemoteHMRSetupModule,
  getRemoteModule,
  getRemoteModuleRegistryModule,
} from './generators';
import { isUsingMFBundleCommand, removeExtension } from './helpers';

interface CreateResolveRequestOptions {
  isRemote: boolean;
  hacks: {
    patchHMRClient: boolean;
    patchInitializeCore: boolean;
  };
  paths: {
    asyncRequire: string;
    hostEntry: string;
    initHost: string;
    originalEntry: string;
    remoteEntry: string;
    remoteHMRSetup: string;
    remoteModuleRegistry: string;
    projectDir: string;
    tmpDir: string;
  };
  options: ModuleFederationConfigNormalized;
  vmManager: VirtualModuleManager;
  customResolver?: CustomResolver;
}

export function createResolveRequest({
  vmManager,
  options,
  hacks,
  paths,
  isRemote,
  customResolver,
}: CreateResolveRequestOptions): CustomResolver {
  const hostEntryPathRegex = getEntryPathRegex({
    entry: paths.hostEntry,
    projectDir: paths.projectDir,
  });
  const remoteEntryPathRegex = getEntryPathRegex({
    entry: paths.remoteEntry,
    projectDir: paths.projectDir,
  });

  return function resolveRequest(context, moduleName, platform) {
    // virtual entrypoint for host
    if (moduleName.match(hostEntryPathRegex)) {
      const hostEntryGenerator = () =>
        getHostEntryModule(options, {
          originalEntry: paths.originalEntry,
          tmpDir: paths.tmpDir,
        });
      vmManager.registerVirtualModule(paths.hostEntry, hostEntryGenerator);
      return { type: 'sourceFile', filePath: paths.hostEntry };
    }

    // virtual entrypoint for remote containers
    if (moduleName.match(remoteEntryPathRegex)) {
      const remoteEntryGenerator = () =>
        getRemoteEntryModule(options, {
          tmpDir: paths.tmpDir,
          projectDir: paths.projectDir,
        });
      vmManager.registerVirtualModule(paths.remoteEntry, remoteEntryGenerator);
      return { type: 'sourceFile', filePath: paths.remoteEntry };
    }

    // virtual module: init-host
    if (moduleName === INIT_HOST) {
      const initHostGenerator = () => getInitHostModule(options);
      vmManager.registerVirtualModule(paths.initHost, initHostGenerator);
      return { type: 'sourceFile', filePath: paths.initHost };
    }

    // virtual module: remote-module-registry
    if (moduleName === REMOTE_MODULE_REGISTRY) {
      const registryGenerator = () => getRemoteModuleRegistryModule();
      vmManager.registerVirtualModule(
        paths.remoteModuleRegistry,
        registryGenerator,
      );
      return { type: 'sourceFile', filePath: paths.remoteModuleRegistry };
    }

    // virtual module: remote-hmr
    if (moduleName === REMOTE_HMR_SETUP) {
      const remoteHMRSetupGenerator = () => getRemoteHMRSetupModule();
      vmManager.registerVirtualModule(
        paths.remoteHMRSetup,
        remoteHMRSetupGenerator,
      );
      return { type: 'sourceFile', filePath: paths.remoteHMRSetup as string };
    }

    // module: async-require
    if (moduleName === ASYNC_REQUIRE) {
      return { type: 'sourceFile', filePath: paths.asyncRequire };
    }

    // shared modules handling in init-host.js
    if ([paths.initHost].includes(context.originModulePath)) {
      // init-host contains definition of shared modules so we need to prevent
      // circular import of shared module, by allowing import shared dependencies directly
      return customResolver
        ? customResolver(context, moduleName, platform)
        : context.resolveRequest(context, moduleName, platform);
    }

    // shared modules handling in remote-entry.js
    if ([paths.remoteEntry].includes(context.originModulePath)) {
      const sharedModule = options.shared[moduleName];
      // import: false means that the module is marked as external
      if (sharedModule && sharedModule.import === false) {
        const sharedPath = getSharedPath(moduleName, paths.tmpDir);
        return { type: 'sourceFile', filePath: sharedPath };
      }
      return customResolver
        ? customResolver(context, moduleName, platform)
        : context.resolveRequest(context, moduleName, platform);
    }

    // remote modules
    for (const remoteName of Object.keys(options.remotes)) {
      if (moduleName.startsWith(remoteName + '/')) {
        const remotePath = getRemoteModulePath(moduleName, paths.tmpDir);
        const remoteGenerator = () => getRemoteModule(moduleName);
        vmManager.registerVirtualModule(remotePath, remoteGenerator);
        return { type: 'sourceFile', filePath: remotePath };
      }
    }

    // shared module handling
    for (const sharedName of Object.keys(options.shared)) {
      const importName = options.shared[sharedName].import || sharedName;
      // module import
      if (moduleName === importName) {
        const sharedPath = getSharedPath(moduleName, paths.tmpDir);
        const sharedGenerator = () => getRemoteModule(moduleName);
        vmManager.registerVirtualModule(sharedPath, sharedGenerator);
        return { type: 'sourceFile', filePath: sharedPath };
      }
    }

    // replace getDevServer module in remote with our own implementation
    if (isRemote && moduleName.endsWith('getDevServer')) {
      const res = customResolver
        ? customResolver(context, moduleName, platform)
        : context.resolveRequest(context, moduleName, platform);
      const from = GET_DEV_SERVER_REGEX;
      const to = resolveModule('getDevServer.ts');
      return replaceModule(from, to)(res);
    }

    // replace HMRClient module with HMRClientShim when using bundle commands
    if (isUsingMFBundleCommand() && moduleName.endsWith('HMRClient')) {
      const res = customResolver
        ? customResolver(context, moduleName, platform)
        : context.resolveRequest(context, moduleName, platform);
      const from = HMR_CLIENT_REGEX;
      const to = resolveModule('HMRClientShim.ts');
      return replaceModule(from, to)(res);
    }

    // patch HMRClient module for older versions of React Native
    // this is needed for avoiding HMR errors between multiple dev servers
    if (
      hacks.patchHMRClient &&
      moduleName.endsWith('HMRClient') &&
      context.originModulePath !== resolveModule('HMRClient.ts')
    ) {
      const res = customResolver
        ? customResolver(context, moduleName, platform)
        : context.resolveRequest(context, moduleName, platform);
      const from = HMR_CLIENT_REGEX;
      const to = resolveModule('HMRClient.ts');
      // replace HMRClient with our own
      return replaceModule(from, to)(res);
    }

    return customResolver
      ? customResolver(context, moduleName, platform)
      : context.resolveRequest(context, moduleName, platform);
  };
}

function getSharedPath(name: string, dir: string) {
  const sharedModuleName = name.replaceAll('/', '_');
  const sharedModuleDir = path.join(dir, 'shared');
  return path.join(sharedModuleDir, `${sharedModuleName}.js`);
}

function getRemoteModulePath(name: string, dir: string) {
  const remoteModuleName = name.replaceAll('/', '_');
  const remoteModuleDir = path.join(dir, 'remote');
  return path.join(remoteModuleDir, `${remoteModuleName}.js`);
}

function resolveModule(moduleName: string): string {
  return path.resolve(__dirname, `../modules/${moduleName}`);
}

function replaceModule(from: RegExp, to: string | null) {
  return (resolved: Resolution): Resolution => {
    if (resolved.type === 'sourceFile' && from.test(resolved.filePath)) {
      if (to === null) return { type: 'empty' };
      return { type: 'sourceFile', filePath: to };
    }
    return resolved;
  };
}

function getEntryPathRegex(paths: {
  entry: string;
  projectDir: string;
}): RegExp {
  const relativeEntryPath = path.relative(paths.projectDir, paths.entry);
  const entryName = removeExtension(relativeEntryPath);
  return new RegExp(`^\\./${entryName}(\\.js)?$`);
}
