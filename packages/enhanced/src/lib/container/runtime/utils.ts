import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import crypto from 'crypto';
import { parseOptions } from '../options';
import type { init } from '@module-federation/runtime-tools';
import type webpack from 'webpack';
import type RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import type {
  ModuleFederationPluginOptions,
  RemotesItem,
} from '../../../declarations/plugins/container/ModuleFederationPlugin';
import { NormalizedRuntimeInitOptionsWithOutShared } from '../../../types/runtime';
import { FEDERATION_SUPPORTED_TYPES } from '@module-federation/webpack-bundler-runtime/constant';

const extractUrlAndGlobal = require(
  normalizeWebpackPath('webpack/lib/util/extractUrlAndGlobal'),
) as typeof import('webpack/lib/util/extractUrlAndGlobal');

const isValidExternalsType = require(
  normalizeWebpackPath(
    'webpack/schemas/plugins/container/ExternalsType.check.js',
  ),
) as typeof import('webpack/schemas/plugins/container/ExternalsType.check.js');

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
    }),
    (item) => ({
      external: Array.isArray(item.external) ? item.external : [item.external],
      shareScope: item.shareScope || options.shareScope || 'default',
    }),
  );
  const remoteOptions: Remotes = [];

  parsedOptions.forEach((parsedOption) => {
    const [alias, remoteInfos] = parsedOption;
    const { external, shareScope } = remoteInfos;
    external.forEach((externalItem, index) => {
      try {
        const { externalType, requestPath } = getExternalTypeAndRequestPath(
          options,
          externalItem,
        );

        if (!FEDERATION_SUPPORTED_TYPES.includes(externalType)) {
          return;
        }
        switch (externalType) {
          case 'script': {
            const [url, globalName] = extractUrlAndGlobal(externalItem);
            remoteOptions.push({
              alias,
              name: globalName,
              entry: url,
              shareScope: shareScope,
            });
            break;
          }
          case 'commonjs':
          case 'commonjs2':
          case 'commonjs-module':
          case 'commonjs-static':
          case 'node-commonjs': {
            // temp workaround
            // TODO: support object remote which type like this: { name:string;entry:string;shareScope?:string }
            const [url, globalName] = extractUrlAndGlobal(externalItem);
            external[index] = `${externalType} ${url}`;
            remoteOptions.push({
              alias,
              name: globalName,
              entry: url,
              type: 'cjs',
              shareScope: shareScope,
            });
            break;
          }
          default:
            break;
        }
      } catch (err) {
        return;
      }
    });
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

export function getExternalTypeAndRequestPath(
  options: ModuleFederationPluginOptions,
  remote: RemotesItem,
) {
  const UNSPECIFIED_EXTERNAL_TYPE_REGEXP = /^[a-z0-9-]+ /;

  const remoteType =
    options.remoteType ||
    (options.library && isValidExternalsType(options.library.type)
      ? options.library.type
      : 'script');
  let type,
    requestPath = '';

  if (UNSPECIFIED_EXTERNAL_TYPE_REGEXP.test(remote)) {
    const idx = remote.indexOf(' ');
    type = remote.slice(0, idx);
    requestPath = remote.slice(idx + 1);
  } else {
    requestPath = remote;
  }

  return {
    externalType: type || remoteType,
    requestPath,
  };
}
