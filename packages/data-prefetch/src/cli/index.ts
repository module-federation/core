import path from 'path';
import fs from 'fs-extra';

import {
  encodeName,
  moduleFederationPlugin,
  MFPrefetchCommon,
} from '@module-federation/sdk';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Compiler, WebpackPluginInstance } from 'webpack';

import { TEMP_DIR } from '../common/constant';
import { fileExistsWithCaseSync, fixPrefetchPath } from '../common/node-utils';
import { getPrefetchId } from '../common/runtime-utils';
import { SHARED_STRATEGY } from '../constant';

const { RuntimeGlobals, Template } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

export function getFederationGlobalScope(
  runtimeGlobals: typeof RuntimeGlobals,
): string {
  return `${runtimeGlobals.require || '__webpack_require__'}.federation`;
}

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

    const { runtimePlugins } = this.options;
    if (!Array.isArray(runtimePlugins)) {
      this.options.runtimePlugins = [];
    }

    const runtimePath = path.resolve(__dirname, './plugin.esm.mjs');
    if (!this.options.runtimePlugins?.includes(runtimePath)) {
      this.options.runtimePlugins!.push(runtimePath);
    }
    if (this.options.shareStrategy !== SHARED_STRATEGY) {
      this.options.shareStrategy = SHARED_STRATEGY;
      console.warn(
        `[Module Federation Data Prefetch]: Your shared strategy is set to '${SHARED_STRATEGY}', this is a necessary condition for data prefetch`,
      );
    }

    const encodedName = encodeName(name as string);
    const asyncEntryPath = path.resolve(
      compiler.options.context,
      `node_modules/${TEMP_DIR}/${encodedName}/bootstrap.js`,
    );
    if (fs.existsSync(asyncEntryPath)) {
      fs.unlinkSync(asyncEntryPath);
    }
    if (!this.options.dataPrefetch) {
      return;
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
        exposePath = exposeValue.import[0];
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

    if (!this._reWriteExports) {
      return;
    }
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
    new compiler.webpack.DefinePlugin({
      FederationDataPrefetch: JSON.stringify(asyncEntryPath),
    }).apply(compiler);
  }

  static addRuntime(
    compiler: Compiler,
    options: {
      name: string;
    },
  ) {
    const encodedName = encodeName(options.name as string);
    if (!compiler.options.context) {
      throw new Error('compiler.options.context is not defined');
    }
    const prefetchEntry = path.resolve(
      compiler.options.context,
      `node_modules/.mf/${encodedName}/bootstrap.js`,
    );
    const federationGlobal = getFederationGlobalScope(
      RuntimeGlobals || ({} as typeof RuntimeGlobals),
    );

    return Template.asString([
      fs.existsSync(prefetchEntry)
        ? Template.indent([
            'function injectPrefetch() {',
            Template.indent([
              `globalThis.__FEDERATION__ = globalThis.__FEDERATION__ || {};`,
              `globalThis.__FEDERATION__['${MFPrefetchCommon.globalKey}'] = globalThis.__FEDERATION__['${MFPrefetchCommon.globalKey}'] || {`,
              `entryLoading: {},`,
              `instance: new Map(),`,
              `__PREFETCH_EXPORTS__: {},`,
              `};`,
              `globalThis.__FEDERATION__['${MFPrefetchCommon.globalKey}']['${MFPrefetchCommon.exportsKey}'] = globalThis.__FEDERATION__['${MFPrefetchCommon.globalKey}']['${MFPrefetchCommon.exportsKey}'] || {};`,
              `globalThis.__FEDERATION__['${MFPrefetchCommon.globalKey}']['${MFPrefetchCommon.exportsKey}']['${options.name}'] = function(){ return import('${prefetchEntry}');}`,
            ]),
            '}',
            `${federationGlobal}.prefetch = injectPrefetch`,
          ])
        : '',
      Template.indent([
        `if(!${federationGlobal}.isMFRemote && ${federationGlobal}.prefetch){`,
        `${federationGlobal}.prefetch()`,
        '}',
      ]),
    ]);
  }

  static setRemoteIdentifier() {
    const federationGlobal = getFederationGlobalScope(
      RuntimeGlobals || ({} as typeof RuntimeGlobals),
    );
    return Template.indent([`${federationGlobal}.isMFRemote = true;`]);
  }

  static removeRemoteIdentifier() {
    const federationGlobal = getFederationGlobalScope(
      RuntimeGlobals || ({} as typeof RuntimeGlobals),
    );
    return Template.indent([`${federationGlobal}.isMFRemote = false;`]);
  }
}
