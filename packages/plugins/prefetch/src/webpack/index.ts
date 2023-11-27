import fs from 'fs';
import path from 'path';

import type { Compiler, WebpackPluginInstance } from 'webpack';
import {
  fixPrefetchPath,
  encodeName,
  getPrefetchId,
  FederationPrefetchCommon,
} from '@module-federation/sdk';

import { TEMP_DIR, PrefetchEntryPath } from './constant';
import { isDev, modifyEntry, fileExistsWithCaseSync } from './utils';

const addTemplate = (name: string) =>
  `
globalThis.__FEDERATION__ = globalThis.__FEDERATION__ || {};
globalThis.__FEDERATION__.${FederationPrefetchCommon.globalKey} = globalThis.__FEDERATION__.${FederationPrefetchCommon.globalKey} || {
  entryLoading: {},
  instance: new Map(),
  __PREFETCH_EXPORTS__: {},
};
globalThis.__FEDERATION__.${FederationPrefetchCommon.globalKey}.${FederationPrefetchCommon.exportsKey} = globalThis.__FEDERATION__.${FederationPrefetchCommon.globalKey}.${FederationPrefetchCommon.exportsKey} || {};
globalThis.__FEDERATION__.${FederationPrefetchCommon.globalKey}.${FederationPrefetchCommon.exportsKey}['${name}'] = import('./bootstrap');
`;

interface PrefetchPluginOptions {
  name: string;
  exposes: Record<string, string | {
    import: string
  }>;
};

export class PrefetchPlugin implements WebpackPluginInstance {
  private _pluginName = 'PrefetchPlugin';
  private _fileName = FederationPrefetchCommon.library;
  private _entryName = FederationPrefetchCommon.identifier;
  private _options: PrefetchPluginOptions;
  private _reWriteExports: string;

  constructor(options: PrefetchPluginOptions) {
    this._options = options;
    this._reWriteExports = '';
  }

  apply(compiler: Compiler) {
    const { exposes, name } = this._options;
    if (!exposes) {
      return;
    }
    const exposeAlias = Object.keys(exposes);
    exposeAlias.forEach(alias => {
      let exposePath;
      const exposeValue = exposes[alias];
      if (typeof exposeValue === 'string') {
        exposePath = exposeValue;
      } else {
        exposePath = exposeValue.import;
      }
      const targetPaths = fixPrefetchPath(exposePath);
      for (const pathItem of targetPaths) {
        const context = compiler.context;
        const absolutePath = path.resolve(context, pathItem);
        if (fileExistsWithCaseSync(absolutePath)) {
          const absoluteAlias = alias.replace('.', '');
          this._reWriteExports += `export * as ${getPrefetchId(
            `${name}${absoluteAlias}`,
          )} from '${absolutePath}';\n`;
          break;
        }
      }
    });

    if (!this._reWriteExports) {
      return;
    }

    const encodedName = encodeName(name);
    const prefetchEntry = path.resolve(
      process.cwd(),
      `node_modules/${TEMP_DIR}/${encodedName}/${PrefetchEntryPath}`,
    );
    const asyncEntryPath = path.resolve(
      process.cwd(),
      `node_modules/${TEMP_DIR}/${encodedName}/bootstrap.js`,
    );
    if (!fs.existsSync(`node_modules/${TEMP_DIR}`)) {
      fs.mkdirSync(`node_modules/${TEMP_DIR}`);
    }
    if (!fs.existsSync(`node_modules/${TEMP_DIR}/${encodedName}`)) {
      fs.mkdirSync(`node_modules/${TEMP_DIR}/${encodedName}`);
    }
    fs.writeFileSync(prefetchEntry, addTemplate(name));
    fs.writeFileSync(asyncEntryPath, this._reWriteExports);

    modifyEntry({
      compiler,
      prependEntry: entry => {
        Object.keys(entry).forEach(entryKey => {
          if (entry[entryKey].import) {
            entry[entryKey].import?.unshift(prefetchEntry);
          }
        });
      },
    });

    const env =
      process.env.NODE_ENV === 'development' ? 'development' : 'production';
    compiler.hooks.make.tapAsync(this._pluginName, (compilation, callback) => {
      const entryKitPath = `@vmok/entry-kit/global/${env}/initial-entry-template`;

      compilation.addEntry(
        compilation.options.context as string,
        compiler.webpack.EntryPlugin.createDependency(
          require.resolve(entryKitPath),
          {
            name: this._entryName,
          },
        ),
        {
          name: this._entryName,
        },
        err => {
          if (err) {
            return callback(err);
          }
          callback();
        },
      );
    });

    compiler.hooks.make.tapAsync(this._pluginName, (compilation, callback) => {
      compilation.addEntry(
        compilation.options.context as string,
        compiler.webpack.EntryPlugin.createDependency(
          require.resolve(prefetchEntry),
          {
            name: this._entryName,
          },
        ),
        {
          name: this._entryName,
          filename: `${this._fileName}_${encodeName(name)}${
            isDev() ? '' : '[contenthash:8]'
          }.js`,
          library: {
            type: 'umd',
            name: this._fileName,
          },
        },
        err => {
          if (err) {
            return callback(err);
          }
          callback();
        },
      );
    });
  }
}
