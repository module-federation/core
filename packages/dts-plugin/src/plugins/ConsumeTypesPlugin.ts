import { infrastructureLogger as logger } from '@module-federation/sdk';
import {
  normalizeOptions,
  type moduleFederationPlugin,
} from '@module-federation/sdk';
import {
  validateOptions,
  consumeTypes,
  DTSManagerOptions,
} from '../core/index';
import { isPrd } from './utils';

import type { Compiler, WebpackPluginInstance } from 'webpack';

export const DEFAULT_CONSUME_TYPES = {
  abortOnError: false,
  consumeAPITypes: true,
  typesOnBuild: false,
};

export const normalizeConsumeTypesOptions = ({
  context,
  dtsOptions,
  pluginOptions,
}: {
  context?: string;
  dtsOptions: moduleFederationPlugin.PluginDtsOptions;
  pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
}) => {
  const normalizedConsumeTypes =
    normalizeOptions<moduleFederationPlugin.DtsHostOptions>(
      true,
      DEFAULT_CONSUME_TYPES,
      'mfOptions.dts.consumeTypes',
    )(dtsOptions.consumeTypes);

  if (!normalizedConsumeTypes) {
    return;
  }
  const dtsManagerOptions = {
    host: {
      implementation: dtsOptions.implementation,
      context,
      moduleFederationConfig: pluginOptions,
      ...normalizedConsumeTypes,
    },
    extraOptions: dtsOptions.extraOptions || {},
    displayErrorInTerminal: dtsOptions.displayErrorInTerminal,
  };
  validateOptions(dtsManagerOptions.host);

  return dtsManagerOptions;
};

export const consumeTypesAPI = async (
  dtsManagerOptions: DTSManagerOptions,
  cb?: (options: moduleFederationPlugin.RemoteTypeUrls) => void,
) => {
  const fetchRemoteTypeUrlsPromise =
    typeof dtsManagerOptions.host.remoteTypeUrls === 'function'
      ? dtsManagerOptions.host.remoteTypeUrls()
      : Promise.resolve(dtsManagerOptions.host.remoteTypeUrls);
  return fetchRemoteTypeUrlsPromise.then((remoteTypeUrls) => {
    consumeTypes({
      ...dtsManagerOptions,
      host: {
        ...dtsManagerOptions.host,
        remoteTypeUrls,
      },
    })
      .then(() => {
        typeof cb === 'function' && cb(remoteTypeUrls);
      })
      .catch(() => {
        typeof cb === 'function' && cb(remoteTypeUrls);
      });
  });
};

export class ConsumeTypesPlugin implements WebpackPluginInstance {
  pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
  dtsOptions: moduleFederationPlugin.PluginDtsOptions;
  callback: () => void;
  fetchRemoteTypeUrlsResolve: (
    options: moduleFederationPlugin.RemoteTypeUrls,
  ) => void;

  constructor(
    pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions,
    dtsOptions: moduleFederationPlugin.PluginDtsOptions,
    fetchRemoteTypeUrlsResolve: (
      options: moduleFederationPlugin.RemoteTypeUrls,
    ) => void,
  ) {
    this.pluginOptions = pluginOptions;
    this.dtsOptions = dtsOptions;
    this.fetchRemoteTypeUrlsResolve = fetchRemoteTypeUrlsResolve;
  }

  apply(compiler: Compiler) {
    const { dtsOptions, pluginOptions, fetchRemoteTypeUrlsResolve } = this;

    const dtsManagerOptions = normalizeConsumeTypesOptions({
      context: compiler.context,
      dtsOptions,
      pluginOptions,
    });

    if (!dtsManagerOptions) {
      fetchRemoteTypeUrlsResolve(undefined);
      return;
    }

    if (isPrd() && !dtsManagerOptions.host.typesOnBuild) {
      fetchRemoteTypeUrlsResolve(undefined);
      return;
    }

    logger.debug('start fetching remote types...');
    const promise = consumeTypesAPI(
      dtsManagerOptions,
      fetchRemoteTypeUrlsResolve,
    );

    compiler.hooks.thisCompilation.tap('mf:generateTypes', (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: 'mf:generateTypes',
          stage:
            // @ts-expect-error use runtime variable in case peer dep not installed , it should execute before generate types
            compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER - 1,
        },
        async () => {
          // await consume types promise to make sure the consumer not throw types error
          await promise;
          logger.debug('fetch remote types success!');
        },
      );
    });
    // only consume once , if remotes update types , DevPlugin will auto sync the latest types
  }
}
