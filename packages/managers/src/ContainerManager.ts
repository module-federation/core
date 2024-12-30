import path from 'path';
import { generateExposeFilename } from '@module-federation/sdk';
import type {
  containerPlugin,
  ManifestModuleInfos,
  moduleFederationPlugin,
} from '@module-federation/sdk';
import { parseOptions } from './utils';
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
  private _parsedOptions?: Array<
    [exposeKey: string, { import: string[]; name?: string }]
  >;

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
      return name;
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
    }, {} as moduleFederationPlugin.ExposesObject);
  }
  // { '.' : './src/Button.jsx' } => { '__federation_expose_Component' : ['src/Buttton'] }
  get exposeFileNameImportMap(): Record<string, string[]> {
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
    return parsedOptions.reduce(
      (sum, item) => {
        const [_exposeKey, exposeObj] = item;
        const { name, import: importPath } = exposeObj;
        sum[name] = importPath;
        return sum;
      },
      {} as Record<string, string[]>,
    );
  }

  // { '.' : './src/Button.jsx' } => { '.' : ['src/Button'] }
  get exposeObject(): Record<string, string[]> {
    const parsedOptions = this._parseOptions();

    return parsedOptions.reduce(
      (sum, item) => {
        const [exposeKey, exposeObject] = item;
        sum[exposeKey] = [];
        exposeObject.import.forEach((item) => {
          const relativePath = path.relative(
            '.',
            item.replace(path.extname(item), ''),
          );
          sum[exposeKey].push(relativePath);
        });
        return sum;
      },
      {} as Record<string, string[]>,
    );
  }

  // { '.' : './src/Button.jsx' } => ['./src/Button.jsx']
  get exposeFiles(): string[] {
    const parsedOptions = this._parseOptions();

    return parsedOptions.reduce((sum, item) => {
      const [_exposeKey, exposeObject] = item;

      sum.push(...exposeObject.import);
      return sum;
    }, [] as string[]);
  }

  get manifestModuleInfos(): ManifestModuleInfos {
    if (this._manifestModuleInfos) {
      return this._manifestModuleInfos;
    }
    // { '.' : './src/Button.jsx' } => { '.' : {  name: 'ExposeEntry', file: './src/Button.jsx', requires: {} } }
    const parsedOptions = this._parseOptions();

    this._manifestModuleInfos = parsedOptions.reduce((sum, item) => {
      const [exposeKey, exposeObject] = item;
      sum[exposeKey] = {
        name: exposeObject.name || normalizeExposeModuleName(exposeKey),
        file: exposeObject.import,
      };
      return sum;
    }, {} as ManifestModuleInfos);
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
    if (this._parsedOptions) {
      return this._parsedOptions;
    }
    this._parsedOptions = parseOptions(
      this.options.exposes!,
      (item) => ({
        import: Array.isArray(item) ? item : [item],
        name: undefined,
      }),
      (item) => ({
        import: Array.isArray(item.import) ? item.import : [item.import],
        name: undefined,
      }),
    );

    return this._parsedOptions;
  }

  override init(
    options: moduleFederationPlugin.ModuleFederationPluginOptions,
  ): void {
    this.setOptions(options);
    this.validate(options.name);
  }

  validate(name?: string): void {
    if (!name) {
      throw new Error(`container name can not be empty!`);
    }
  }
}

export { ContainerManager };
