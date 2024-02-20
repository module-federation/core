import path from 'path';
import type {
  ManifestModuleInfos,
  moduleFederationPlugin,
} from '@module-federation/sdk';
import { getBuildVersion, parseOptions } from './utils';
import type { EntryObject } from 'webpack';
import { BasicPluginOptionsManager } from './BasicPluginOptionsManager';

function normalizeExposeModuleName(exposeKey: string): string {
  const relativePath = path.relative('.', exposeKey);
  if (!relativePath) {
    return 'ExposeEntry';
  }

  return relativePath;
}

class ContainerManager extends BasicPluginOptionsManager<moduleFederationPlugin.ModuleFederationPluginOptions> {
  private _manifestModuleInfos?: ManifestModuleInfos;

  override get enable(): boolean {
    return Boolean(
      this.options.name &&
        this.options.exposes &&
        (Array.isArray(this.options.exposes)
          ? this.options.exposes.length > 0
          : Object.keys(this.options.exposes).length > 0),
    );
  }

  get globalEntryName(): string {
    const { name } = this.options;
    const version = getBuildVersion();

    return `__VMOK_${name}:${version}__`;
  }

  // { '.' : './src/Button.jsx' } => { '.' : ['src/Button'] }
  get exposeObject(): Record<string, string> {
    const parsedOptions = this._parseOptions();

    return Object.keys(parsedOptions).reduce((sum, exposeKey) => {
      const parsedOption = parsedOptions[exposeKey];
      sum[exposeKey] = [];
      let importArr = Array.isArray(parsedOption.import)
        ? parsedOption.import
        : [parsedOption.import];
      importArr.forEach((item) => {
        const relativePath = path.relative(
          '.',
          item.replace(path.extname(item), ''),
        );
        sum[exposeKey].push(relativePath);
      });
      return sum;
    }, {});
  }

  // { '.' : './src/Button.jsx' } => ['./src/Button.jsx']
  get exposeFiles(): string[] {
    const parsedOptions = this._parseOptions();

    return Object.keys(parsedOptions).reduce((sum, exposeKey) => {
      const parsedOption = parsedOptions[exposeKey];
      let importArr = Array.isArray(parsedOption.import)
        ? parsedOption.import
        : [parsedOption.import];
      sum.push(...importArr);
      return sum;
    }, [] as string[]);
  }

  get manifestModuleInfos(): ManifestModuleInfos {
    if (this._manifestModuleInfos) {
      return this._manifestModuleInfos;
    }
    // { '.' : './src/Button.jsx' } => { '.' : {  name: 'ExposeEntry', file: './src/Button.jsx', requires: {} } }
    const parsedOptions = this._parseOptions();

    this._manifestModuleInfos = Object.keys(parsedOptions).reduce(
      (sum, exposeKey) => {
        const parsedOption = parsedOptions[exposeKey];
        sum[exposeKey] = {
          name: parsedOption.name || normalizeExposeModuleName(exposeKey),
          file: Array.isArray(parsedOption.import)
            ? parsedOption.import
            : [parsedOption.import],
        };
        return sum;
      },
      {} as ManifestModuleInfos,
    );
    return this._manifestModuleInfos;
  }
  // { '.' : './src/Button.jsx' } => { index: './src/Button.jsx' }
  get webpackEntry(): EntryObject {
    return Object.values(this.manifestModuleInfos).reduce((sum, cur) => {
      const entry =
        cur.name === 'ExposeEntry'
          ? 'index'
          : cur.name.slice(0, 1).toLowerCase() + cur.name.slice(1);
      sum[entry] = cur.file;
      return sum;
    }, {} as EntryObject);
  }

  private _parseOptions() {
    return parseOptions(
      this.options.exposes!,
      (item) => ({
        import: item,
        name: undefined,
      }),
      (item) => ({
        import: item.import,
        name: undefined,
      }),
    );
  }

  override init(
    options: moduleFederationPlugin.ModuleFederationPluginOptions,
  ): void {
    this.setOptions(options);
    this.validate(options.name);
  }

  validate(name?: string): void {
    if (!name) {
      throw new Error(`name can not be empty!`);
    }
  }
}

export { ContainerManager };
