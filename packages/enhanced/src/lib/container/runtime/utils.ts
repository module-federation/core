import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import crypto from 'crypto';
import { parseOptions } from '../options';
import type { init } from '@module-federation/runtime';
import type webpack from 'webpack';
import type RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import type { ModuleFederationPluginOptions } from '../../../declarations/plugins/container/ModuleFederationPlugin';
import { NormalizedRuntimeInitOptionsWithOutShared } from '../../../types/runtime';

const extractUrlAndGlobal = require(
  normalizeWebpackPath('webpack/lib/util/extractUrlAndGlobal'),
) as typeof import('webpack/lib/util/extractUrlAndGlobal');

type EntryStaticNormalized = Awaited<
  ReturnType<Extract<webpack.WebpackOptionsNormalized['entry'], () => any>>
>;

type Remotes = Parameters<typeof init>[0]['remotes'];

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
  options: ModuleFederationPluginOptions,
): NormalizedRuntimeInitOptionsWithOutShared {
  const parsedOptions = parseOptions(
    options.remotes || [],
    (item) => ({
      external: Array.isArray(item) ? item : [item],
      shareScope: options.shareScope || 'default',
      name: undefined,
    }),
    (item) => ({
      external: Array.isArray(item.external) ? item.external : [item.external],
      shareScope: item.shareScope || options.shareScope || 'default',
      name: item.name,
    }),
  );
  const remoteOptions: Remotes = [];
  parsedOptions.forEach((parsedOption) => {
    const [alias, remoteInfos] = parsedOption;
    // TODO: Handle the case of multiple elements in the external array (处理 external 数组多元素的情况)
    const { external, shareScope, name } = remoteInfos;
    try {
      // only fit for remoteType: 'script'
      const [url, globalName] = extractUrlAndGlobal(external[0]);
      remoteOptions.push({
        alias,
        name: name || globalName,
        entry: url,
        shareScope: shareScope,
        // externalType
      });
    } catch (err) {
      return;
    }
  });

  const initOptionsWithoutShared = {
    name: options.name!,
    remotes: remoteOptions,
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
