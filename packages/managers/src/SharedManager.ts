// @ts-ignore this pkg miss types
import findPkg from 'find-pkg';
import path from 'path';
import fs from 'fs-extra';
import { sharing } from 'webpack';
import {
  moduleFederationPlugin,
  sharePlugin,
  isRequiredVersion,
} from '@module-federation/sdk';
import { NormalizedSharedOptions } from './types';
import { BasicPluginOptionsManager } from './BasicPluginOptionsManager';
import { parseOptions } from './utils';

type SharePluginOptions = ConstructorParameters<typeof sharing.SharePlugin>[0];

class SharedManager extends BasicPluginOptionsManager<moduleFederationPlugin.ModuleFederationPluginOptions> {
  normalizedOptions: NormalizedSharedOptions = {};

  override get enable(): boolean {
    return Boolean(Object.keys(this.sharedPluginOptions.shared).length);
  }

  get sharedPluginOptions(): SharePluginOptions {
    const normalizedShared = this.normalizedOptions;
    const shared = Object.keys(normalizedShared).reduce((sum, cur) => {
      const {
        singleton,
        requiredVersion,
        version,
        eager,
        shareScope,
        import: sharedImport,
      } = normalizedShared[cur];
      sum[cur] = {
        singleton,
        requiredVersion,
        version,
        eager,
        shareScope,
        import: sharedImport,
      };
      return sum;
    }, {} as moduleFederationPlugin.SharedObject);
    return {
      shared,
      shareScope: this.options.shareScope || 'default',
    };
  }

  findPkg(
    name: string,
    shareConfig: sharePlugin.SharedConfig,
  ): {
    pkg: Record<string, any>;
    path: string;
    pkgPath: string;
  } {
    try {
      let pkgPath: string = '';
      let depName = name;
      if (shareConfig.import) {
        if (path.isAbsolute(shareConfig.import)) {
          pkgPath = shareConfig.import;
        } else if (shareConfig.import.startsWith('.')) {
          pkgPath = path.resolve(process.cwd(), shareConfig.import);
        }
      } else {
        if (shareConfig.packageName) {
          depName = shareConfig.packageName;
        }
      }
      pkgPath = pkgPath || require.resolve(depName, { paths: [process.cwd()] });
      const pkgJsonPath = findPkg.sync(pkgPath);
      return {
        pkg: JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8')),
        path: '',
        pkgPath: '',
      };
    } catch (err) {
      return {
        pkg: {},
        path: '',
        pkgPath: '',
      };
    }
  }

  transformSharedConfig(
    sharedConfig: sharePlugin.SharedConfig,
  ): sharePlugin.SharedConfig {
    const defaultSharedConfig: sharePlugin.SharedConfig = {
      singleton: true,
      requiredVersion: undefined,
      shareScope: 'default',
    };

    return {
      ...defaultSharedConfig,
      ...sharedConfig,
    };
  }

  normalizeOptions(
    options: moduleFederationPlugin.ModuleFederationPluginOptions['shared'],
  ): void {
    const normalizedShared: NormalizedSharedOptions = {};

    const sharedOptions: [string, sharePlugin.SharedConfig][] = parseOptions(
      options!,
      (item, key) => {
        if (typeof item !== 'string')
          throw new Error('Unexpected array in shared');
        const config: sharePlugin.SharedConfig =
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

    sharedOptions.forEach((item) => {
      const [sharedName, sharedOptions] = item;
      const pkgInfo = this.findPkg(sharedName, sharedOptions);
      const sharedConfig = this.transformSharedConfig(sharedOptions);
      normalizedShared[sharedName] = {
        ...sharedConfig,
        requiredVersion:
          typeof sharedConfig.requiredVersion !== 'undefined'
            ? sharedConfig.requiredVersion
            : `^${pkgInfo.pkg['version']}`,
        name: sharedName,
        version: pkgInfo.pkg['version'],
        eager: Boolean(sharedConfig.eager),
      };
    });

    this.normalizedOptions = normalizedShared;
  }

  override init(
    options: moduleFederationPlugin.ModuleFederationPluginOptions,
  ): void {
    this.setOptions(options);
    this.normalizeOptions(options.shared);
  }
}

export { SharedManager };
