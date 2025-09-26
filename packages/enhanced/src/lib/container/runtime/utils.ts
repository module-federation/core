/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Zackary Jackson @ScriptedAlchemy
*/
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import upath from 'upath';
import path from 'path';
import crypto from 'crypto';
import { parseOptions } from '../options';
import type webpack from 'webpack';
import type RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import { NormalizedRuntimeInitOptionsWithOutShared } from '../../../types/runtime';

const extractUrlAndGlobal = require(
  normalizeWebpackPath('webpack/lib/util/extractUrlAndGlobal'),
) as typeof import('webpack/lib/util/extractUrlAndGlobal');

type EntryStaticNormalized = Awaited<
  ReturnType<Extract<webpack.WebpackOptionsNormalized['entry'], () => any>>
>;

interface ModifyEntryOptions {
  compiler: webpack.Compiler;
  prependEntry?: (entry: EntryStaticNormalized) => void;
  staticEntry?: EntryStaticNormalized;
}

export function getFederationGlobalScope(
  runtimeGlobals: typeof RuntimeGlobals,
): string {
  return `${runtimeGlobals.require || '__webpack_require__'}.federation`;
}

export function normalizeRuntimeInitOptionsWithOutShared(
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
): NormalizedRuntimeInitOptionsWithOutShared {
  const parsedOptions = parseOptions(
    options.remotes || [],
    (item) => ({
      external: Array.isArray(item) ? item : [item],
      shareScope: options.shareScope || 'default',
    }),
    (item) => ({
      external: Array.isArray(item.external) ? item.external : [item.external],
      shareScope: item.shareScope || options.shareScope || 'default',
    }),
  );
  const remoteOptions: NormalizedRuntimeInitOptionsWithOutShared['remotes'] =
    [];
  parsedOptions.forEach((parsedOption) => {
    const [alias, remoteInfos] = parsedOption;
    const { external, shareScope } = remoteInfos;
    external.forEach((externalItem) => {
      try {
        const entry = externalItem;
        if (/\s/.test(entry)) {
          return;
        }
        const [url, globalName] = extractUrlAndGlobal(externalItem);
        remoteOptions.push({
          alias,
          name: globalName,
          entry: url,
          shareScope: shareScope,
          externalType: 'script',
        });
      } catch (err) {
        const getExternalTypeFromExternal = (external: string) => {
          if (/^[a-z0-9-]+ /.test(external)) {
            const idx = external.indexOf(' ');
            return [
              external.slice(0, idx) as moduleFederationPlugin.ExternalsType,
              external.slice(idx + 1),
            ] as const;
          }
          return null;
        };
        remoteOptions.push({
          alias,
          name: '',
          entry: '',
          shareScope: shareScope,
          // @ts-ignore
          externalType: getExternalTypeFromExternal(externalItem) || 'unknown',
        });
        return;
      }
    });
  });

  const initOptionsWithoutShared = {
    name: options.name!,
    remotes: remoteOptions,
    shareStrategy: options.shareStrategy || 'version-first',
  };

  return initOptionsWithoutShared;
}

export function modifyEntry(options: ModifyEntryOptions): void {
  const { compiler, staticEntry, prependEntry } = options;
  const operator = (
    oriEntry: EntryStaticNormalized,
    newEntry: EntryStaticNormalized,
  ): EntryStaticNormalized => Object.assign(oriEntry, newEntry);

  if (typeof compiler.options.entry === 'function') {
    const prevEntryFn = compiler.options.entry;
    compiler.options.entry = async () => {
      let res = await prevEntryFn();
      if (staticEntry) {
        res = operator(res, staticEntry);
      }
      if (prependEntry) {
        prependEntry(res);
      }
      return res;
    };
  } else {
    if (staticEntry) {
      compiler.options.entry = operator(compiler.options.entry, staticEntry);
    }
    if (prependEntry) {
      prependEntry(compiler.options.entry);
    }
  }
}

export function createHash(contents: string): string {
  return crypto.createHash('md5').update(contents).digest('hex');
}

export const normalizeToPosixPath = (p: string) =>
  upath.normalizeSafe(path.normalize(p || ''));
