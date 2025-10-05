/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/

'use strict';
import type { Compiler } from 'webpack';
import { isRequiredVersion } from '@module-federation/sdk';
import { parseOptions } from '../container/options';
import ConsumeSharedPlugin from './ConsumeSharedPlugin';
import ProvideSharedPlugin from './ProvideSharedPlugin';
import type {
  SharePluginOptions,
  SharedConfig,
} from '../../declarations/plugins/sharing/SharePlugin';
import type { ConsumesConfig } from '../../declarations/plugins/sharing/ConsumeSharedPlugin';
import type { ProvidesConfig } from '../../declarations/plugins/sharing/ProvideSharedPlugin';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { createSchemaValidation } from '../../utils';

const validate = createSchemaValidation(
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../../schemas/sharing/SharePlugin.check.js').validate,
  () => require('../../schemas/sharing/SharePlugin').default,
  {
    name: 'Share Plugin',
    baseDataPath: 'options',
  },
);

class SharePlugin {
  private _shareScope: string | string[];
  private _consumes: Record<string, ConsumesConfig>[];
  private _provides: Record<string, ProvidesConfig>[];

  constructor(options: SharePluginOptions) {
    validate(options);

    const sharedOptions: [string, SharedConfig][] = parseOptions(
      options.shared,
      (item, key) => {
        if (typeof item !== 'string')
          throw new Error(
            `Unexpected array in shared configuration for key "${key}"`,
          );
        const config: SharedConfig =
          item === key || !isRequiredVersion(item)
            ? {
                import: item,
              }
            : {
                import: key,
                requiredVersion: item,
              };
        return config;
      },
      (item) => item,
    );
    const consumes: Record<string, ConsumesConfig>[] = sharedOptions.map(
      ([key, options]) => ({
        [key]: {
          import: options.import,
          shareKey: options.shareKey || key,
          shareScope: options.shareScope,
          requiredVersion: options.requiredVersion,
          strictVersion: options.strictVersion,
          singleton: options.singleton,
          packageName: options.packageName,
          eager: options.eager,
          issuerLayer: options.issuerLayer,
          layer: options.layer,
          request: options.request || key,
          exclude: options.exclude,
          include: options.include,
          nodeModulesReconstructedLookup:
            options.nodeModulesReconstructedLookup,
        },
      }),
    );
    const provides: Record<string, ProvidesConfig>[] = sharedOptions
      .filter(([, options]) => options.import !== false)
      .map(([key, options]) => ({
        [options.import || key]: {
          shareKey: options.shareKey || key,
          shareScope: options.shareScope,
          version: options.version,
          eager: options.eager,
          requiredVersion: options.requiredVersion,
          strictVersion: options.strictVersion,
          singleton: options.singleton,
          layer: options.layer,
          request: options.request || options.import || key,
          exclude: options.exclude,
          include: options.include,
          nodeModulesReconstructedLookup:
            options.nodeModulesReconstructedLookup,
        },
      }));

    this._shareScope = options.shareScope || 'default';
    this._consumes = consumes;
    this._provides = provides;
  }

  getOptions(): {
    shareScope: string | string[];
    consumes: Record<string, ConsumesConfig>[];
    provides: Record<string, ProvidesConfig>[];
  } {
    return {
      shareScope: Array.isArray(this._shareScope)
        ? [...this._shareScope]
        : this._shareScope,
      consumes: this._consumes.map((consume) => ({ ...consume })),
      provides: this._provides.map((provide) => ({ ...provide })),
    };
  }

  getShareScope(): string | string[] {
    return Array.isArray(this._shareScope)
      ? [...this._shareScope]
      : this._shareScope;
  }

  getConsumes(): Record<string, ConsumesConfig>[] {
    return this._consumes.map((consume) => ({ ...consume }));
  }

  getProvides(): Record<string, ProvidesConfig>[] {
    return this._provides.map((provide) => ({ ...provide }));
  }

  getSharedInfo(): {
    totalShared: number;
    consumeOnly: number;
    provideAndConsume: number;
    shareScopes: string[];
  } {
    const consumeEntries = new Set(
      this._consumes.flatMap((consume) =>
        Object.entries(consume).map(
          ([key, config]) => config.shareKey || config.request || key,
        ),
      ),
    );
    const provideEntries = new Set(
      this._provides.flatMap((provide) =>
        Object.entries(provide).map(
          ([key, config]) => config.shareKey || config.request || key,
        ),
      ),
    );

    let provideAndConsume = 0;
    for (const key of consumeEntries) {
      if (provideEntries.has(key)) {
        provideAndConsume++;
      }
    }

    const totalShared = this._consumes.length;
    const consumeOnly = totalShared - provideAndConsume;
    const shareScopes = Array.isArray(this._shareScope)
      ? [...this._shareScope]
      : [this._shareScope];

    return {
      totalShared,
      consumeOnly,
      provideAndConsume,
      shareScopes,
    };
  }

  /**
   * Applies the plugin to the webpack compiler instance
   * @param compiler - The webpack compiler instance
   */
  apply(compiler: Compiler): void {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);

    new ConsumeSharedPlugin({
      shareScope: this._shareScope,
      consumes: this._consumes,
    }).apply(compiler);

    new ProvideSharedPlugin({
      shareScope: this._shareScope,
      provides: this._provides,
    }).apply(compiler);
  }
}

export default SharePlugin;
