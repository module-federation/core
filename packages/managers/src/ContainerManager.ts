import path from 'path';
import { generateExposeFilename } from '@module-federation/sdk';
import type {
  containerPlugin,
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

  get globalEntryName(): string | undefined {
    const { name, library } = this.options;

    if (library) {
      if (typeof library.name === 'string') {
        return library.name;
      }
      return undefined;
    }

    return name;
  }

  get containerPluginExposesOptions(): containerPlugin.ContainerPluginOptions['exposes'] {
    const { exposes } = this.options;
    const parsedOptions = parseOptions(
      exposes!,
      (item, key) => ({
        import: Array.isArray(item) ? item : [item],
        name: generateExposeFilename(key, false),
      }),
      (item, key) => ({
        import: Array.isArray(item.import) ? item.import : [item.import],
        name: item.name || generateExposeFilename(key, false),
      }),
    );

    return parsedOptions.reduce((sum, item) => {
      const [exposeKey, exposeObj] = item;
      sum[exposeKey] = exposeObj;
      return sum;
    }, {});
  }
  // { '.' : './src/Button.jsx' } => { '__federation_expose_Component' : 'src/Buttton' }
  get exposeFileNameImportMap(): Record<string, string> {
    const { exposes } = this.options;
    const parsedOptions = parseOptions(
      exposes!,
      (item, key) => ({
        import: Array.isArray(item) ? item : [item],
        name: generateExposeFilename(key, false),
      }),
      (item, key) => ({
        import: Array.isArray(item.import) ? item.import : [item.import],
        name: item.name || generateExposeFilename(key, false),
      }),
    );
    return parsedOptions.reduce((sum, item) => {
      const [_exposeKey, exposeObj] = item;
      const { name, import: importPath } = exposeObj;
      sum[name] = importPath;
      return sum;
    }, {});
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
  // { '.' : './src/Button.jsx' } => { index: ['./src/Button.jsx'] }
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
