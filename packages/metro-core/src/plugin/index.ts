import path from 'node:path';
import { promises as fs } from 'node:fs';
import util from 'node:util';
import type { ConfigT } from 'metro-config';
import type {
  ModuleFederationConfig,
  ModuleFederationConfigNormalized,
  ModuleFederationExtraOptions,
} from '../types';
import { VirtualModuleManager } from '../utils';
import type { FederatedTypesMeta } from '../utils/federated-remote-types';
import {
  applyTypesMetaToManifest,
  maybeGenerateFederatedRemoteTypes,
} from '../utils/federated-remote-types';
import { createBabelTransformer } from './babel-transformer';
import {
  isUsingMFBundleCommand,
  isUsingMFCommand,
  prepareTmpDir,
  replaceExtension,
  stubHostEntry,
  stubRemoteEntry,
} from './helpers';
import { createManifest } from './manifest';
import { normalizeExtraOptions } from './normalize-extra-options';
import { normalizeOptions } from './normalize-options';
import { createResolveRequest } from './resolver';
import { createRewriteRequest } from './rewrite-request';
import { getModuleFederationSerializer } from './serializer';
import { validateOptions } from './validate-options';

declare global {
  // eslint-disable-next-line no-var
  var __METRO_FEDERATION_CONFIG: ModuleFederationConfigNormalized;
  // eslint-disable-next-line no-var
  var __METRO_FEDERATION_ORIGINAL_ENTRY_PATH: string | undefined;
  // eslint-disable-next-line no-var
  var __METRO_FEDERATION_REMOTE_ENTRY_PATH: string | undefined;
  // eslint-disable-next-line no-var
  var __METRO_FEDERATION_MANIFEST_PATH: string | undefined;
  // eslint-disable-next-line no-var
  var __METRO_FEDERATION_DTS_ASSETS: FederatedTypesMeta | undefined;
}

export function withModuleFederation(
  config: ConfigT,
  federationOptions: ModuleFederationConfig,
  extraOptions?: ModuleFederationExtraOptions,
): ConfigT {
  if (isUsingMFCommand()) {
    return augmentConfig(config, federationOptions, extraOptions);
  }

  console.warn(
    util.styleText(
      'yellow',
      'Warning: Module Federation build is disabled for this command.\n',
    ) +
      util.styleText(
        'yellow',
        'To enable Module Federation, please use one of the dedicated bundle commands:\n',
      ) +
      ` ${util.styleText('dim', '•')} bundle-mf-host` +
      util.styleText('dim', ' - for bundling a host application\n') +
      ` ${util.styleText('dim', '•')} bundle-mf-remote` +
      util.styleText('dim', ' - for bundling a remote application\n'),
  );

  return config;
}

function augmentConfig(
  config: ConfigT,
  federationOptions: ModuleFederationConfig,
  extraOptions?: ModuleFederationExtraOptions,
): ConfigT {
  const isHost = !federationOptions.exposes;
  const isRemote = !isHost;

  const tmpDirPath = prepareTmpDir(config.projectRoot);

  validateOptions(federationOptions);

  const options = normalizeOptions(federationOptions, {
    projectRoot: config.projectRoot,
    tmpDirPath,
  });

  const { flags } = normalizeExtraOptions(extraOptions);

  const vmManager = new VirtualModuleManager(config);

  // original host entrypoint, usually <projectRoot>/index.js
  const { originalEntryFilename, originalEntryPath } = getOriginalEntry(
    config.projectRoot,
    'index.js',
  );

  // virtual host entrypoint
  const hostEntryFilename = originalEntryFilename;
  const hostEntryPath = path.resolve(tmpDirPath, hostEntryFilename);

  // virtual remote entrypoint
  const remoteEntryFilename = replaceExtension(options.filename, '.js');
  const remoteEntryPath = path.resolve(tmpDirPath, remoteEntryFilename);

  // other virtual modules
  const initHostPath = path.resolve(tmpDirPath, 'init-host.js');
  const remoteHMRSetupPath = path.resolve(tmpDirPath, 'remote-hmr.js');
  const remoteModuleRegistryPath = path.resolve(
    tmpDirPath,
    'remote-module-registry.js',
  );

  const asyncRequirePath = require.resolve('../modules/asyncRequire.ts');

  const babelTransformerPath = createBabelTransformer({
    blacklistedPaths: [initHostPath, remoteEntryPath],
    federationConfig: options,
    originalBabelTransformerPath: config.transformer.babelTransformerPath,
    tmpDirPath: tmpDirPath,
    enableInitializeCorePatching: flags.unstable_patchInitializeCore,
    enableRuntimeRequirePatching: flags.unstable_patchRuntimeRequire,
  });

  const manifestPath = createManifest(options, tmpDirPath);

  // host and remote entries are entry points, so they need to be present in the filesystem
  // we create stubs on the filesystem and then redirect corresponding virtual modules
  stubHostEntry(hostEntryPath);
  stubRemoteEntry(remoteEntryPath);

  // pass data to bundle-mf-remote command
  global.__METRO_FEDERATION_CONFIG = options;
  global.__METRO_FEDERATION_HOST_ENTRY_PATH = hostEntryPath;
  global.__METRO_FEDERATION_REMOTE_ENTRY_PATH = remoteEntryPath;
  global.__METRO_FEDERATION_MANIFEST_PATH = manifestPath;
  global.__METRO_FEDERATION_DTS_ASSETS = undefined;

  maybeGenerateRemoteTypesForStart({
    isRemote,
    options,
    projectRoot: config.projectRoot,
    tmpDirPath,
    manifestPath,
  });

  return {
    ...config,
    serializer: {
      ...config.serializer,
      customSerializer: getModuleFederationSerializer(
        options,
        isUsingMFBundleCommand(),
      ),
      getModulesRunBeforeMainModule: (entryFilePath) => {
        // skip altering the list of modules when unstable_patchInitializeCore is enabled
        if (flags.unstable_patchInitializeCore) {
          return config.serializer.getModulesRunBeforeMainModule(entryFilePath);
        }
        // remove existing pre-modules like InitializeCore for remote entrypoints
        if (isRemote) {
          return [];
        }
        // prepend init-host to the list of modules to ensure it's run first
        return [
          initHostPath,
          ...config.serializer.getModulesRunBeforeMainModule(entryFilePath),
        ];
      },
      getRunModuleStatement: (moduleId: number | string) => {
        return `${options.name}__r(${JSON.stringify(moduleId)});`;
      },
      getPolyfills: (options) => {
        return isHost ? config.serializer.getPolyfills(options) : [];
      },
    },
    transformer: {
      ...config.transformer,
      globalPrefix: options.name,
      babelTransformerPath: babelTransformerPath,
      getTransformOptions: vmManager.getTransformOptions(),
    },
    resolver: {
      ...config.resolver,
      resolveRequest: createResolveRequest({
        isRemote,
        vmManager,
        options,
        paths: {
          asyncRequire: asyncRequirePath,
          originalEntry: originalEntryPath,
          hostEntry: hostEntryPath,
          initHost: initHostPath,
          remoteModuleRegistry: remoteModuleRegistryPath,
          remoteHMRSetup: remoteHMRSetupPath,
          remoteEntry: remoteEntryPath,
          projectDir: config.projectRoot,
          tmpDir: tmpDirPath,
        },
        hacks: {
          patchHMRClient: flags.unstable_patchHMRClient,
          patchInitializeCore: flags.unstable_patchInitializeCore,
        },
        customResolver: config.resolver.resolveRequest,
      }),
    },
    server: {
      ...config.server,
      enhanceMiddleware: vmManager.getMiddleware(),
      rewriteRequestUrl: createRewriteRequest({
        config,
        originalEntryFilename,
        remoteEntryFilename,
        manifestPath,
        tmpDirPath,
        getDtsAssetNames: () => global.__METRO_FEDERATION_DTS_ASSETS,
      }),
    },
  };
}

function maybeGenerateRemoteTypesForStart(opts: {
  isRemote: boolean;
  options: ModuleFederationConfigNormalized;
  projectRoot: string;
  tmpDirPath: string;
  manifestPath: string;
}) {
  if (process.argv[2] !== 'start') {
    return;
  }
  if (!opts.isRemote || opts.options.dts === false) {
    return;
  }

  void (async () => {
    try {
      const typesMeta = await maybeGenerateFederatedRemoteTypes({
        federationConfig: opts.options,
        projectRoot: opts.projectRoot,
        outputDir: opts.tmpDirPath,
        logger: console,
      });

      if (!typesMeta) {
        return;
      }

      global.__METRO_FEDERATION_DTS_ASSETS = typesMeta;
      const manifest = JSON.parse(
        await fs.readFile(opts.manifestPath, 'utf-8'),
      ) as Record<string, any>;
      applyTypesMetaToManifest(manifest, typesMeta);
      await fs.writeFile(
        opts.manifestPath,
        JSON.stringify(manifest, undefined, 2),
        'utf-8',
      );
    } catch (error) {
      console.warn(
        `${util.styleText('yellow', 'Failed to generate federated types for dev server:')}\n${String(error)}`,
      );
    }
  })();
}

function getOriginalEntry(
  projectRoot: string,
  entryFilename: string,
): {
  originalEntryFilename: string;
  originalEntryPath: string;
} {
  const originalEntryFilename = path.basename(
    global.__METRO_FEDERATION_ORIGINAL_ENTRY_PATH ?? entryFilename,
  );
  const originalEntryPath = path.resolve(
    projectRoot,
    global.__METRO_FEDERATION_ORIGINAL_ENTRY_PATH ?? entryFilename,
  );
  return { originalEntryFilename, originalEntryPath };
}
