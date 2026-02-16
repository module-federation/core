import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import util from 'node:util';
import { mergeConfig } from 'metro';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import type { ModuleFederationConfigNormalized } from '../../types';
import { CLIError } from '../../utils/errors';
import type { OutputOptions, RequestOptions } from '../../utils/metro-compat';
import { Server } from '../../utils/metro-compat';
import type { Config } from '../types';
import { createModulePathRemapper } from '../utils/create-module-path-remapper';
import { createResolver } from '../utils/create-resolver';
import loadMetroConfig from '../utils/load-metro-config';
import { saveBundleAndMap } from '../utils/save-bundle-and-map';

import type { BundleFederatedRemoteArgs } from './types';
import {
  generateTypesAPI,
  normalizeDtsOptions,
  normalizeGenerateTypesOptions,
} from '@module-federation/dts-plugin';
import {
  consumeTypes,
  retrieveTypesAssetsInfo,
} from '@module-federation/dts-plugin/core';

const DEFAULT_OUTPUT = 'dist';

declare global {
  // eslint-disable-next-line no-var
  var __METRO_FEDERATION_CONFIG: ModuleFederationConfigNormalized;
  // eslint-disable-next-line no-var
  var __METRO_FEDERATION_ORIGINAL_ENTRY_PATH: string | undefined;
  // eslint-disable-next-line no-var
  var __METRO_FEDERATION_REMOTE_ENTRY_PATH: string | undefined;
  // eslint-disable-next-line no-var
  var __METRO_FEDERATION_MANIFEST_PATH: string | undefined;
}

interface ModuleDescriptor {
  [moduleName: string]: {
    isContainerModule?: boolean;
    moduleInputFilepath: string;
    moduleOutputDir: string;
  };
}

interface BundleRequestOptions extends RequestOptions {
  lazy: boolean;
  modulesOnly: boolean;
  runModule: boolean;
  sourceUrl: string;
}

async function maybeGenerateFederatedRemoteTypes(opts: {
  federationConfig: ModuleFederationConfigNormalized;
  projectRoot: string;
  outputDir: string;
  logger: Pick<Console, 'info' | 'warn'>;
}): Promise<{ zipName: string; apiFileName: string } | undefined> {
  const { federationConfig, projectRoot, outputDir, logger } = opts;

  if (federationConfig.dts === false) {
    return;
  }

  // Safer default for Metro: enable generateTypes, but do not fetch remote types unless
  // explicitly configured via `dts: { consumeTypes: ... }`.
  const dtsConfig =
    federationConfig.dts === true
      ? { consumeTypes: false }
      : federationConfig.dts;

  const mfOptions: moduleFederationPlugin.ModuleFederationPluginOptions = {
    name: federationConfig.name,
    filename: federationConfig.filename,
    remotes: federationConfig.remotes,
    exposes: federationConfig.exposes,
    shared: federationConfig.shared as any,
    dts: dtsConfig as any,
  };

  const normalizedDtsOptions = normalizeDtsOptions(mfOptions, projectRoot, {
    defaultGenerateOptions: {
      generateAPITypes: true,
      compileInChildProcess: false,
      abortOnError: false,
      extractThirdParty: false,
      extractRemoteTypes: false,
    },
    defaultConsumeOptions: {
      abortOnError: true,
      consumeAPITypes: true,
    },
  });

  if (!normalizedDtsOptions) {
    return;
  }

  const dtsManagerOptions = normalizeGenerateTypesOptions({
    context: projectRoot,
    outputDir,
    dtsOptions: normalizedDtsOptions,
    pluginOptions: mfOptions,
  });

  if (!dtsManagerOptions) {
    return;
  }

  // If the remote consumes types from other remotes, fetch first so generateTypes can succeed.
  if (dtsManagerOptions.host) {
    let remoteTypeUrls = dtsManagerOptions.host.remoteTypeUrls as any;
    if (typeof remoteTypeUrls === 'function') {
      remoteTypeUrls = await remoteTypeUrls();
    }
    await consumeTypes({
      ...dtsManagerOptions,
      host: {
        ...dtsManagerOptions.host,
        remoteTypeUrls,
      },
    });
  }

  logger.info(`${util.styleText('blue', 'Generating federated types (d.ts)')}`);
  await generateTypesAPI({ dtsManagerOptions });

  const { zipTypesPath, apiTypesPath, zipName, apiFileName } =
    retrieveTypesAssetsInfo(dtsManagerOptions.remote);

  const produced: { zipName?: string; apiFileName?: string } = {};
  const fileExists = async (p: string) => {
    try {
      await fs.stat(p);
      return true;
    } catch {
      return false;
    }
  };

  if (zipTypesPath && zipName && (await fileExists(zipTypesPath))) {
    produced.zipName = zipName;
  }
  if (apiTypesPath && apiFileName && (await fileExists(apiTypesPath))) {
    produced.apiFileName = apiFileName;
  }
  if (process.env['FEDERATION_DEBUG']) {
    logger.info(
      `dts debug: zipTypesPath=${zipTypesPath} zipExists=${String(
        Boolean(produced.zipName),
      )} apiTypesPath=${apiTypesPath} apiExists=${String(
        Boolean(produced.apiFileName),
      )}`,
    );
  }

  if (!produced.zipName && !produced.apiFileName) {
    logger.warn(
      `${util.styleText('yellow', 'Federated types enabled, but no types files were produced.')}`,
    );
    return;
  }

  logger.info(
    `Done writing federated types:\n${util.styleText(
      'dim',
      [produced.zipName, produced.apiFileName].filter(Boolean).join('\n'),
    )}`,
  );

  return {
    zipName: produced.zipName ?? '',
    apiFileName: produced.apiFileName ?? '',
  };
}

async function buildBundle(server: Server, requestOpts: BundleRequestOptions) {
  const bundle = await server.build({
    ...Server.DEFAULT_BUNDLE_OPTIONS,
    ...requestOpts,
  });

  return bundle;
}

function getRequestOpts(
  args: BundleFederatedRemoteArgs,
  opts: {
    isContainerModule: boolean;
    entryFile: string;
    sourceUrl: string;
    sourceMapUrl: string;
  },
): BundleRequestOptions {
  return {
    dev: args.dev,
    minify: args.minify !== undefined ? args.minify : !args.dev,
    platform: args.platform,
    entryFile: opts.entryFile,
    sourceUrl: opts.sourceUrl,
    sourceMapUrl: opts.sourceMapUrl,
    // only use lazy for container bundles
    lazy: opts.isContainerModule,
    // only run module for container bundles
    runModule: opts.isContainerModule,
    // remove prelude for non-container modules
    modulesOnly: !opts.isContainerModule,
  };
}

function getSaveBundleOpts(
  args: BundleFederatedRemoteArgs,
  opts: {
    bundleOutput: string;
    sourcemapOutput: string;
  },
): OutputOptions {
  return {
    indexedRamBundle: false,
    bundleEncoding: args.bundleEncoding,
    dev: args.dev,
    platform: args.platform,
    sourcemapSourcesRoot: args.sourcemapSourcesRoot,
    sourcemapUseAbsolutePath: args.sourcemapUseAbsolutePath,
    bundleOutput: opts.bundleOutput,
    sourcemapOutput: opts.sourcemapOutput,
  };
}

async function bundleFederatedRemote(
  _argv: Array<string>,
  cfg: Config,
  args: BundleFederatedRemoteArgs,
): Promise<void> {
  const rawConfig = await loadMetroConfig(cfg, {
    maxWorkers: args.maxWorkers,
    resetCache: args.resetCache,
    config: args.config,
  });

  const logger = cfg.logger ?? console;

  // TODO: pass this without globals
  const federationConfig = global.__METRO_FEDERATION_CONFIG;
  if (!federationConfig) {
    logger.error(
      `${util.styleText('red', 'error')} Module Federation configuration is missing.`,
    );
    logger.info(
      "Import the plugin 'withModuleFederation' " +
        "from '@module-federation/metro' package " +
        'and wrap your final Metro config with it.',
    );
    throw new CLIError('Bundling failed');
  }

  // TODO: pass this without globals
  const containerEntryFilepath = global.__METRO_FEDERATION_REMOTE_ENTRY_PATH;
  if (!containerEntryFilepath) {
    logger.error(
      `${util.styleText('red', 'error')} Cannot determine the container entry file path.`,
    );
    logger.info(
      'To bundle a container, you need to expose at least one module ' +
        'in your Module Federation configuration.',
    );
    throw new CLIError('Bundling failed');
  }

  // TODO: pass this without globals
  const manifestFilepath = global.__METRO_FEDERATION_MANIFEST_PATH;
  if (!manifestFilepath) {
    logger.error(
      `${util.styleText('red', 'error')} Cannot determine the manifest file path.`,
    );
    throw new CLIError('Bundling failed');
  }

  if (rawConfig.resolver.platforms.indexOf(args.platform) === -1) {
    logger.error(
      `${util.styleText('red', 'error')}: Invalid platform ${
        args.platform ? `"${util.styleText('bold', args.platform)}" ` : ''
      }selected.`,
    );

    logger.info(
      `Available platforms are: ${rawConfig.resolver.platforms
        .map((x) => `"${util.styleText('bold', x)}"`)
        .join(
          ', ',
        )}. If you are trying to bundle for an out-of-tree platform, it may not be installed.`,
    );

    throw new CLIError('Bundling failed');
  }

  // This is used by a bazillion of npm modules we don't control so we don't
  // have other choice than defining it as an env variable here.
  process.env.NODE_ENV = args.dev ? 'development' : 'production';

  // wrap the resolveRequest with our own remapper
  // to replace the paths of remote/shared modules
  const modulePathRemapper = createModulePathRemapper();

  const config = mergeConfig(rawConfig, {
    resolver: {
      // remap the paths of remote & shared modules to prevent raw project paths
      // ending up in the bundles e.g. ../../node_modules/lodash.js -> shared/lodash.js
      resolveRequest: (context, moduleName, platform) => {
        // always defined since we define it in the MF plugin
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const originalResolveRequest = rawConfig.resolver!.resolveRequest!;
        const res = originalResolveRequest(context, moduleName, platform);
        return modulePathRemapper.remap(res);
      },
    },
    serializer: {
      // since we override the paths of split modules, we need to remap the module ids
      // back to the original paths, so that they point to correct modules in runtime
      // note: the split modules become separate entrypoints, and entrypoints are not
      // resolved using the metro resolver, so the only way is to remap the module ids
      createModuleIdFactory: () => {
        const factory = rawConfig.serializer.createModuleIdFactory();
        return (path: string) => factory(modulePathRemapper.reverse(path));
      },
    },
  });

  const server = new Server(config);

  // hack: setup enhance middleware to trigger virtual modules setup
  config.server.enhanceMiddleware(server.processRequest, server);

  const resolver = await createResolver(server, args.platform);

  const outputDir = args.output
    ? path.resolve(path.join(args.output, args.platform))
    : path.resolve(
        config.projectRoot,
        path.join(DEFAULT_OUTPUT, args.platform),
      );

  const containerModule: ModuleDescriptor = {
    [federationConfig.filename]: {
      moduleInputFilepath: containerEntryFilepath,
      moduleOutputDir: outputDir,
      isContainerModule: true,
    },
  };

  // hack: resolve the container entry to register it as a virtual module
  resolver.resolve({
    from: config.projectRoot,
    to: `./${path.relative(config.projectRoot, containerEntryFilepath)}`,
  });

  const exposedModules = Object.entries(federationConfig.exposes)
    .map(([moduleName, moduleFilepath]) => [
      moduleName.slice(2),
      moduleFilepath,
    ])
    .reduce((acc, [moduleName, moduleInputFilepath]) => {
      acc[moduleName] = {
        moduleInputFilepath: path.resolve(
          config.projectRoot,
          moduleInputFilepath,
        ),
        moduleOutputDir: path.resolve(outputDir, 'exposed'),
        isContainerModule: false,
      };
      return acc;
    }, {} as ModuleDescriptor);

  const sharedModules = Object.entries(federationConfig.shared)
    .filter(([, sharedConfig]) => {
      return !sharedConfig.eager && sharedConfig.import !== false;
    })
    .reduce((acc, [moduleName]) => {
      const inputFilepath = resolver.resolve({
        from: containerEntryFilepath,
        to: moduleName,
      });
      acc[moduleName] = {
        moduleInputFilepath: inputFilepath,
        moduleOutputDir: path.resolve(outputDir, 'shared'),
        isContainerModule: false,
      };
      return acc;
    }, {} as ModuleDescriptor);

  const requests = Object.entries({
    ...containerModule,
    ...exposedModules,
    ...sharedModules,
  }).map(
    ([
      moduleName,
      { moduleInputFilepath, moduleOutputDir, isContainerModule = false },
    ]) => {
      const moduleBundleName = isContainerModule
        ? moduleName
        : `${moduleName}.bundle`;
      const moduleBundleFilepath = path.resolve(
        moduleOutputDir,
        moduleBundleName,
      );
      // Metro requires `sourceURL` to be defined when doing bundle splitting
      // we use relative path and supply it in fileURL format to avoid issues
      const moduleBundleUrl = pathToFileURL(
        '/' + path.relative(outputDir, moduleBundleFilepath),
      ).href;
      const moduleSourceMapName = `${moduleBundleName}.map`;
      const moduleSourceMapFilepath = path.resolve(
        moduleOutputDir,
        moduleSourceMapName,
      );
      // use relative path just like when bundling `index.bundle`
      const moduleSourceMapUrl = path.relative(
        outputDir,
        moduleSourceMapFilepath,
      );

      if (!isContainerModule) {
        modulePathRemapper.addMapping(
          moduleInputFilepath,
          path.relative(outputDir, moduleBundleFilepath),
        );
      }

      return {
        targetDir: path.dirname(moduleBundleFilepath),
        requestOpts: getRequestOpts(args, {
          isContainerModule,
          entryFile: moduleInputFilepath,
          sourceUrl: moduleBundleUrl,
          sourceMapUrl: moduleSourceMapUrl,
        }),
        saveBundleOpts: getSaveBundleOpts(args, {
          bundleOutput: moduleBundleFilepath,
          sourcemapOutput: moduleSourceMapFilepath,
        }),
      };
    },
  );

  try {
    logger.info(
      `${util.styleText('blue', 'Processing remote container and exposed modules')}`,
    );

    for (const { requestOpts, saveBundleOpts, targetDir } of requests) {
      // ensure output directory exists
      await fs.mkdir(targetDir, { recursive: true, mode: 0o755 });
      const bundle = await buildBundle(server, requestOpts);
      await saveBundleAndMap(bundle, saveBundleOpts, logger.info);

      // Save the assets of the bundle
      // const outputAssets = await server.getAssets({
      //   ...Server.DEFAULT_BUNDLE_OPTIONS,
      //   ...requestOpts,
      // });

      // When we're done saving bundle output and the assets, we're done.
      // return await saveAssets(
      //   outputAssets,
      //   args.platform,
      //   args.assetsDest,
      //   args.assetCatalogDest
      // );
    }

    const manifestOutputFilepath = path.resolve(outputDir, 'mf-manifest.json');

    // Intentional: type assets are generated during remote bundling because
    // they describe the remote container artifacts emitted by this command.
    const typesMeta = await maybeGenerateFederatedRemoteTypes({
      federationConfig,
      projectRoot: config.projectRoot,
      outputDir,
      logger,
    });

    logger.info(`${util.styleText('blue', 'Processing manifest')}`);
    const rawManifest = JSON.parse(
      await fs.readFile(manifestFilepath, 'utf-8'),
    );
    if (typesMeta?.zipName || typesMeta?.apiFileName) {
      rawManifest.metaData = rawManifest.metaData || {};
      rawManifest.metaData.types = rawManifest.metaData.types || {};
      if (typesMeta.zipName) rawManifest.metaData.types.zip = typesMeta.zipName;
      if (typesMeta.apiFileName)
        rawManifest.metaData.types.api = typesMeta.apiFileName;
    }
    await fs.writeFile(
      manifestOutputFilepath,
      JSON.stringify(rawManifest, undefined, 2),
      'utf-8',
    );
    logger.info(
      `Done writing MF Manifest to:\n${util.styleText('dim', manifestOutputFilepath)}`,
    );
  } finally {
    // incomplete types - this should be awaited
    await server.end();
  }
}

export default bundleFederatedRemote;

export { default as bundleFederatedRemoteOptions } from './options';
