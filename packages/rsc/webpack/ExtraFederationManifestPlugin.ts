import type { Compiler, WebpackPluginInstance } from 'webpack';
import { StatsPlugin } from '@module-federation/manifest';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import fs from 'node:fs';
import path from 'node:path';

type ExtraFederationManifestPluginOptions = {
  mfOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
  manifest: moduleFederationPlugin.PluginManifestOptions;
};

/**
 * Emit an additional MF manifest from the same compilation.
 * Useful for layered server builds that need both RSC + SSR manifests.
 */
export default class ExtraFederationManifestPlugin
  implements WebpackPluginInstance
{
  private _statsPlugin: StatsPlugin;

  constructor(options: ExtraFederationManifestPluginOptions) {
    const pkgVersion = (() => {
      try {
        const pkgPath = path.join(__dirname, '..', 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as {
          version?: string;
        };
        return pkg.version || '0.0.0';
      } catch (_err) {
        return '0.0.0';
      }
    })();
    const mfOptions = {
      ...(options?.mfOptions || {}),
      manifest: options?.manifest,
    } as moduleFederationPlugin.ModuleFederationPluginOptions;

    this._statsPlugin = new StatsPlugin(mfOptions, {
      pluginVersion: pkgVersion,
      bundler: 'webpack',
    });
  }

  apply(compiler: Compiler): void {
    this._statsPlugin.apply(compiler);
  }
}
