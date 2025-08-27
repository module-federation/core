import path from 'node:path';
import util from 'node:util';
import Server from 'metro/src/Server';
import type { RequestOptions } from 'metro/src/shared/types';
import type { ModuleFederationConfigNormalized } from '../../types';
import { CLIError } from '../../utils/errors';
import type { Config } from '../types';
import { createResolver } from '../utils/create-resolver';
import { getCommunityCliPlugin } from '../utils/get-community-plugin';
import loadMetroConfig from '../utils/load-metro-config';
import { saveBundleAndMap } from '../utils/save-bundle-and-map';
import type { BundleFederatedHostArgs } from './types';

declare global {
  var __METRO_FEDERATION_CONFIG: ModuleFederationConfigNormalized;
  var __METRO_FEDERATION_ORIGINAL_ENTRY_PATH: string | undefined;
  var __METRO_FEDERATION_HOST_ENTRY_PATH: string | undefined;
  var __METRO_FEDERATION_REMOTE_ENTRY_PATH: string | undefined;
  var __METRO_FEDERATION_MANIFEST_PATH: string | undefined;
}

async function bundleFederatedHost(
  _argv: Array<string>,
  cfg: Config,
  args: BundleFederatedHostArgs,
): Promise<void> {
  const logger = cfg.logger ?? console;

  // expose original entrypoint
  // TODO: pass this without globals
  global.__METRO_FEDERATION_ORIGINAL_ENTRY_PATH = args.entryFile;

  const config = await loadMetroConfig(cfg, {
    maxWorkers: args.maxWorkers,
    resetCache: args.resetCache,
    config: args.config,
  });

  // TODO: pass this without globals
  const hostEntryFilepath = global.__METRO_FEDERATION_HOST_ENTRY_PATH;
  if (!hostEntryFilepath) {
    logger.error(
      `${util.styleText('red', 'error')} Cannot determine the host entrypoint path.`,
    );
    throw new CLIError('Bundling failed');
  }

  // use virtual host entrypoint
  args.entryFile = hostEntryFilepath;

  const communityCliPlugin = getCommunityCliPlugin(cfg.reactNativePath);

  const buildBundleWithConfig =
    communityCliPlugin.unstable_buildBundleWithConfig;

  return buildBundleWithConfig(args, config, {
    build: async (server: Server, requestOpts: RequestOptions) => {
      // setup enhance middleware to trigger virtual modules setup
      config.server.enhanceMiddleware(server.processRequest, server);
      const resolver = await createResolver(server, args.platform);
      // hack: resolve the host entry to register it as a virtual module
      resolver.resolve({
        from: config.projectRoot,
        to: `./${path.relative(config.projectRoot, hostEntryFilepath)}`,
      });

      return server.build({
        ...Server.DEFAULT_BUNDLE_OPTIONS,
        ...requestOpts,
      });
    },
    save: saveBundleAndMap,
    formatName: 'bundle',
  });
}

export default bundleFederatedHost;

export { default as bundleFederatedHostOptions } from './options';
