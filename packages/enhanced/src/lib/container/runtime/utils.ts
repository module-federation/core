/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Zackary Jackson @ScriptedAlchemy
*/
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import upath from 'upath';
import path from 'path';
import crypto from 'crypto';
import { parseOptions } from '../options';
import type { init } from '@module-federation/runtime-tools';
import type webpack from 'webpack';
import type RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import { NormalizedRuntimeInitOptionsWithOutShared } from '../../../types/runtime';
import { FEDERATION_SUPPORTED_TYPES } from '../constant';

const extractUrlAndGlobal = require(
  normalizeWebpackPath('webpack/lib/util/extractUrlAndGlobal'),
) as typeof import('webpack/lib/util/extractUrlAndGlobal');

type EntryStaticNormalized = Awaited<
  ReturnType<Extract<webpack.WebpackOptionsNormalized['entry'], () => any>>
>;

type BaseRemote = Parameters<typeof init>[0]['remotes'][0];
type Remote = BaseRemote & {
  externalType?: string;
};
type Remotes = Remote[];

interface ModifyEntryOptions {
  compiler: webpack.Compiler;
  prependEntry?: (entry: EntryStaticNormalized) => void;
  staticEntry?: EntryStaticNormalized;
}

// Add supported types constant
const SUPPORTED_TYPES = [...FEDERATION_SUPPORTED_TYPES, 'commonjs-module'];

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
  const generalRemoteType =
    options.remoteType || options.library?.type || 'script';
  const remoteOptions: Remotes = [];
  parsedOptions.forEach((parsedOption) => {
    const [alias, remoteInfos] = parsedOption;
    const { external, shareScope } = remoteInfos;
    try {
      const entry = external[0];
      if (!entry || typeof entry !== 'string') return;

      // Skip invalid entries with spaces (unless they have a valid type prefix)
      if (
        /^\s|\s$/.test(entry) ||
        (/\s/.test(entry) &&
          !entry.match(/^(commonjs|commonjs-module|script)\s/))
      ) {
        return;
      }

      // Check if entry starts with a supported type prefix
      const typeMatch = entry.match(
        /^(commonjs|commonjs-module|script)\s+(.+)$/,
      );
      const externalType = typeMatch ? typeMatch[1] : generalRemoteType;
      const actualEntry = typeMatch ? typeMatch[2] : entry;

      let url;
      let globalName = '';

      // Try to extract URL and global name first
      try {
        const [extractedUrl, extractedGlobal] =
          extractUrlAndGlobal(actualEntry);
        url = extractedUrl;
        globalName = extractedGlobal || '';
      } catch (err) {
        // If extractUrlAndGlobal fails, check if it's a URL with @ format
        const atMatch = actualEntry.match(/^([^@]+)@(.+)$/);
        if (atMatch) {
          globalName = atMatch[1];
          url = atMatch[2];
        } else {
          // If neither works, use the entry as is
          url = actualEntry;
          // For commonjs types, we don't need a global name
          if (
            externalType !== 'commonjs' &&
            externalType !== 'commonjs-module'
          ) {
            globalName = '';
          }
        }
      }

      remoteOptions.push({
        alias,
        name: globalName,
        entry: url,
        shareScope: shareScope,
        externalType,
      } as Remote);
    } catch (err) {
      // Skip invalid entries
      return;
    }
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
