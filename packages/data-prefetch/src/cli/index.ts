import path from 'path';
import fs from 'fs-extra';

import {
  encodeName,
  moduleFederationPlugin,
  MFPrefetchCommon,
} from '@module-federation/sdk';
import type { Compiler, WebpackPluginInstance } from 'webpack';

import { TEMP_DIR } from '../common/constant';
import { fileExistsWithCaseSync, fixPrefetchPath } from '../common/node-utils';
import { getPrefetchId } from '../common/runtime-utils';

const addTemplate = (name: string) =>
  `
export default function () {
  let hasInit = false;
  return {
    name: 'data-prefetch-init-plugin',
    beforeInit(args) {
      if (!hasInit) {
        hasInit = true;
        globalThis.__FEDERATION__ = globalThis.__FEDERATION__ || {};
        globalThis.__FEDERATION__['${MFPrefetchCommon.globalKey}'] = globalThis.__FEDERATION__['${MFPrefetchCommon.globalKey}'] || {
          entryLoading: {},
          instance: new Map(),
          __PREFETCH_EXPORTS__: {},
        };
        globalThis.__FEDERATION__['${MFPrefetchCommon.globalKey}']['${MFPrefetchCommon.exportsKey}'] = globalThis.__FEDERATION__['${MFPrefetchCommon.globalKey}']['${MFPrefetchCommon.exportsKey}'] || {};
        globalThis.__FEDERATION__['${MFPrefetchCommon.globalKey}']['${MFPrefetchCommon.exportsKey}']['${name}'] = import('./bootstrap');
      }
      return args;
    }
  }
}
`;

export class PrefetchPlugin implements WebpackPluginInstance {
  public options: moduleFederationPlugin.ModuleFederationPluginOptions;
  private _reWriteExports: string;

  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this.options = options;
    this._reWriteExports = '';
  }

  // eslint-disable-next-line max-lines-per-function
  apply(compiler: Compiler) {
    const { name, exposes } = this.options;
    if (!exposes) {
      return;
    }
    if (!compiler.options.context) {
      throw new Error('compiler.options.context is not defined');
    }
    const prefetchs: Array<string> = [];
    const exposeAlias = Object.keys(exposes);
    exposeAlias.forEach((alias) => {
      let exposePath;
      // @ts-ignore
      const exposeValue = exposes[alias];
      if (typeof exposeValue === 'string') {
        exposePath = exposeValue;
      } else {
        exposePath = exposeValue.import;
      }
      const targetPaths = fixPrefetchPath(exposePath);
      for (const pathItem of targetPaths) {
        const absolutePath = path.resolve(compiler.options.context!, pathItem);
        if (fileExistsWithCaseSync(absolutePath)) {
          prefetchs.push(pathItem);
          const absoluteAlias = alias.replace('.', '');
          this._reWriteExports += `export * as ${getPrefetchId(
            `${name}${absoluteAlias}`,
          )} from '${absolutePath}';\n`;
          break;
        }
      }
    });

    const { runtimePlugins } = this.options;
    if (!Array.isArray(runtimePlugins)) {
      this.options.runtimePlugins = [];
    }
    this.options.runtimePlugins!.push(
      path.resolve(__dirname, '../esm/plugin.js'),
    );

    if (!this._reWriteExports) {
      return;
    }

    const encodedName = encodeName(name as string);
    const asyncEntryPath = path.resolve(
      compiler.options.context,
      `node_modules/${TEMP_DIR}/${encodedName}/bootstrap.js`,
    );
    const tempDirRealPath = path.resolve(
      compiler.options.context,
      'node_modules',
      TEMP_DIR,
    );
    if (!fs.existsSync(tempDirRealPath)) {
      fs.mkdirSync(tempDirRealPath);
    }
    if (!fs.existsSync(`${tempDirRealPath}/${encodedName}`)) {
      fs.mkdirSync(`${tempDirRealPath}/${encodedName}`);
    }
    fs.writeFileSync(asyncEntryPath, this._reWriteExports);

    const prefetchVmokEntry = path.resolve(
      compiler.options.context,
      `node_modules/${TEMP_DIR}/${encodedName}/${MFPrefetchCommon.fileName}`,
    );
    fs.writeFileSync(prefetchVmokEntry, addTemplate(name as string));
    this.options.runtimePlugins!.push(prefetchVmokEntry);
  }
}
