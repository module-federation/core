import path from 'node:path';
import { ModuleFederationPlugin as RspackModuleFederationPlugin } from '@module-federation/rspack';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import {
  applyAutomaticAssetAdaptation,
  isAppDirectoryCompiler,
} from './asset-adapter';
import { DEFAULT_SHARE_SCOPE, DEFAULT_SHARE_SCOPE_BROWSER } from './internal';
import { normalizeNextRemotes } from './remotes';
import { applyServerCompilerEnhancements } from './server-compiler';
import { PersistManifestAssetsPlugin } from './server-asset-publisher';

export type NextFederationPluginOptions =
  moduleFederationPlugin.ModuleFederationPluginOptions;

type NextCompilerName = 'server' | 'client';

type CompilerLike = {
  options: {
    externals?: unknown[];
    name?: string;
    target?: unknown;
    node?: Record<string, unknown>;
    watchOptions?: {
      ignored?: string | RegExp | Array<string | RegExp>;
      [key: string]: unknown;
    };
    plugins?: Array<{
      constructor?: { name?: string };
      name?: string;
      appDirEnabled?: boolean;
    }>;
    module?: {
      rules?: Array<Record<string, unknown>>;
    };
    output?: {
      uniqueName?: string;
      publicPath?: unknown;
      environment?: Record<string, unknown>;
      [key: string]: unknown;
    };
  };
};

type LegacyNextFederationOptions = NextFederationPluginOptions & {
  extraOptions?: unknown;
};
type ValidNextFederationOptions = NextFederationPluginOptions & {
  name: string;
  filename: NonNullable<NextFederationPluginOptions['filename']>;
};

type ExternalContextLike = {
  request?: string;
};

type ExternalItemValue = string | boolean | string[] | Record<string, unknown>;

type ExternalHandler = (
  ctx: ExternalContextLike,
  callback: (err?: Error | null, result?: ExternalItemValue) => void,
) => ExternalItemValue | Promise<ExternalItemValue | undefined> | undefined;

const NEXT_WATCH_IGNORES = ['**/node_modules/**', '**/@mf-types/**'] as const;
const DEFAULT_CLIENT_MANIFEST_PATH = '/static/chunks';
const DEFAULT_SERVER_MANIFEST_PATH = '';
const LEGACY_EXTRA_OPTION_KEYS = [
  'automaticPageStitching',
  'debug',
  'enableImageLoaderFix',
  'enableUrlLoaderFix',
  'exposePages',
  'skipSharingNextInternals',
] as const;

const isCompilerName = (value: string | undefined): value is NextCompilerName =>
  value === 'server' || value === 'client';

const getCompilerName = (
  compiler: CompilerLike,
): NextCompilerName | undefined =>
  isCompilerName(compiler.options.name) ? compiler.options.name : undefined;

const mergeIgnoredWatchEntries = (
  ignored: string | RegExp | Array<string | RegExp> | undefined,
): Array<string | RegExp> => {
  if (!ignored) {
    return [...NEXT_WATCH_IGNORES];
  }

  const entries = Array.isArray(ignored) ? [...ignored] : [ignored];
  for (const pattern of NEXT_WATCH_IGNORES) {
    if (!entries.includes(pattern)) {
      entries.push(pattern);
    }
  }

  return entries;
};

const NEXTJS_MF_RUNTIME_PLUGIN_REQUEST =
  '@module-federation/nextjs-mf/runtime-plugin';

const resolveRuntimePluginPath = (): string => {
  try {
    return require.resolve(NEXTJS_MF_RUNTIME_PLUGIN_REQUEST);
  } catch {
    return path.resolve(__dirname, '..', 'runtime-plugin.js');
  }
};

const resolveNodeRuntimePluginPath = (): string =>
  require.resolve('@module-federation/node/runtimePlugin');

const prependRuntimePlugins = (
  compilerName: NextCompilerName,
  runtimePlugins: ValidNextFederationOptions['runtimePlugins'],
): ValidNextFederationOptions['runtimePlugins'] => {
  const normalizedRuntimePlugins = runtimePlugins ? [...runtimePlugins] : [];
  const injectedRuntimePlugins = [
    ...(compilerName === 'server' ? [resolveNodeRuntimePluginPath()] : []),
    resolveRuntimePluginPath(),
  ];

  for (const injectedRuntimePlugin of injectedRuntimePlugins.reverse()) {
    const alreadyInjected = normalizedRuntimePlugins.some((plugin) =>
      Array.isArray(plugin)
        ? plugin[0] === injectedRuntimePlugin
        : plugin === injectedRuntimePlugin,
    );

    if (!alreadyInjected) {
      normalizedRuntimePlugins.unshift(injectedRuntimePlugin);
    }
  }

  return normalizedRuntimePlugins;
};

const normalizeManifestOptions = (
  manifest: ValidNextFederationOptions['manifest'],
  compilerName: NextCompilerName,
): ValidNextFederationOptions['manifest'] => {
  if (manifest === false) {
    return false;
  }

  const defaultFilePath =
    compilerName === 'server'
      ? DEFAULT_SERVER_MANIFEST_PATH
      : DEFAULT_CLIENT_MANIFEST_PATH;

  if (!manifest || manifest === true) {
    return { filePath: defaultFilePath };
  }

  return {
    ...manifest,
    filePath: manifest.filePath ?? defaultFilePath,
  };
};

const normalizeSharedOptions = (
  compilerName: NextCompilerName,
  shared: ValidNextFederationOptions['shared'],
): ValidNextFederationOptions['shared'] => {
  const defaults =
    compilerName === 'server'
      ? DEFAULT_SHARE_SCOPE
      : DEFAULT_SHARE_SCOPE_BROWSER;

  if (Array.isArray(shared)) {
    const normalizedShared: moduleFederationPlugin.SharedObject = {};

    for (const item of shared) {
      if (typeof item === 'string') {
        normalizedShared[item] = {};
        continue;
      }

      Object.assign(normalizedShared, item);
    }

    return {
      ...defaults,
      ...normalizedShared,
    };
  }

  return {
    ...defaults,
    ...(shared || {}),
  };
};

const isExternalItemValue = (value: unknown): value is ExternalItemValue =>
  typeof value === 'string' ||
  typeof value === 'boolean' ||
  Array.isArray(value) ||
  (!!value && typeof value === 'object');

const isExternalHandler = (value: unknown): value is ExternalHandler =>
  typeof value === 'function';

const runExternalHandler = async (
  external: ExternalHandler,
  ctx: ExternalContextLike,
): Promise<ExternalItemValue | undefined> => {
  return new Promise((resolve, reject) => {
    let settled = false;
    const settle = (err?: Error | null, result?: unknown) => {
      if (settled) {
        return;
      }
      settled = true;

      if (err) {
        reject(err);
        return;
      }

      resolve(isExternalItemValue(result) ? result : undefined);
    };

    const maybePromise = external(ctx, (err, result) => {
      settle(err, result);
    });

    if (maybePromise !== undefined) {
      Promise.resolve(maybePromise)
        .then((result) => {
          settle(undefined, result);
        })
        .catch((error: unknown) => {
          settle(error instanceof Error ? error : new Error(String(error)));
        });
    }
  });
};

const isSharedImportEnabled = (sharedConfigValue: unknown): boolean => {
  if (!sharedConfigValue || typeof sharedConfigValue !== 'object') {
    return true;
  }

  if (!Object.prototype.hasOwnProperty.call(sharedConfigValue, 'import')) {
    return true;
  }

  return Reflect.get(sharedConfigValue, 'import') !== false;
};

const patchServerExternals = (
  compiler: CompilerLike,
  options: ValidNextFederationOptions,
): void => {
  if (!Array.isArray(compiler.options.externals)) {
    return;
  }

  const functionIndex = compiler.options.externals.findIndex((external) =>
    isExternalHandler(external),
  );
  if (functionIndex === -1) {
    return;
  }

  const originalExternal = compiler.options.externals[functionIndex];
  if (!isExternalHandler(originalExternal)) {
    return;
  }

  compiler.options.externals[functionIndex] = async (
    ctx: ExternalContextLike,
  ): Promise<ExternalItemValue | undefined> => {
    const fromNext = await runExternalHandler(originalExternal, ctx);
    if (typeof fromNext !== 'string') {
      return fromNext;
    }

    const request = fromNext.split(' ')[1];
    if (!request) {
      return undefined;
    }

    const sharedEntries =
      options.shared &&
      !Array.isArray(options.shared) &&
      typeof options.shared === 'object'
        ? Object.entries(options.shared)
        : [];
    const isSharedRequest = sharedEntries.some(([key, sharedConfigValue]) => {
      if (!isSharedImportEnabled(sharedConfigValue)) {
        return false;
      }

      return key.endsWith('/') ? request.includes(key) : request === key;
    });

    if (
      ctx.request &&
      (ctx.request.includes('@module-federation/') || isSharedRequest)
    ) {
      return undefined;
    }

    if (
      request.startsWith('next') ||
      request.startsWith('react/') ||
      request.startsWith('react-dom/') ||
      request === 'react' ||
      request === 'react-dom' ||
      request === 'styled-jsx/style'
    ) {
      return fromNext;
    }

    return undefined;
  };
};

const assertValidOptions = (options: LegacyNextFederationOptions): void => {
  if (!options.name) {
    throw new Error('Module federation "name" option must be specified');
  }

  if (!options.filename) {
    throw new Error('filename is not defined in NextFederation options');
  }

  if (!Object.prototype.hasOwnProperty.call(options, 'extraOptions')) {
    return;
  }

  const providedExtraOptions =
    options.extraOptions &&
    typeof options.extraOptions === 'object' &&
    !Array.isArray(options.extraOptions)
      ? Object.keys(options.extraOptions as Record<string, unknown>)
      : [];
  const knownLegacyOptions = providedExtraOptions.filter((key) =>
    LEGACY_EXTRA_OPTION_KEYS.includes(
      key as (typeof LEGACY_EXTRA_OPTION_KEYS)[number],
    ),
  );
  const detail = knownLegacyOptions.length
    ? ` Found legacy options: ${knownLegacyOptions.join(', ')}.`
    : '';

  throw new Error(
    `nextjs-mf no longer accepts the legacy extraOptions surface.${detail} Pass only standard Module Federation options to the root plugin.`,
  );
};

const normalizeCompiler = (
  compiler: CompilerLike,
  compilerName: NextCompilerName,
  containerName: string,
): void => {
  compiler.options.watchOptions = {
    ...compiler.options.watchOptions,
    ignored: mergeIgnoredWatchEntries(compiler.options.watchOptions?.ignored),
  };
  compiler.options.output = {
    ...compiler.options.output,
    uniqueName: containerName,
    environment: {
      ...(compiler.options.output?.environment || {}),
      asyncFunction: true,
    },
  };

  const output = compiler.options.output;

  if (compilerName === 'client' && output?.publicPath === '/_next/') {
    output.publicPath = 'auto';
  }

  if (compilerName === 'server') {
    compiler.options.node = {
      ...(compiler.options.node || {}),
      global: false,
    };
    compiler.options.target = 'async-node';
  }
};

const normalizeOptionsForCompiler = (
  options: ValidNextFederationOptions,
  compilerName: NextCompilerName,
): ValidNextFederationOptions => {
  const experiments =
    options.experiments && typeof options.experiments === 'object'
      ? { ...options.experiments }
      : {};

  return {
    ...options,
    runtime: false,
    remoteType: options.remoteType ?? 'script',
    library:
      compilerName === 'server'
        ? {
            type: 'commonjs-module',
            name: options.name,
          }
        : {
            type: 'window',
            name: options.name,
          },
    filename:
      compilerName === 'server' && typeof options.filename === 'string'
        ? path.basename(options.filename)
        : options.filename,
    remotes: normalizeNextRemotes(options.remotes),
    shared: normalizeSharedOptions(compilerName, options.shared),
    manifest: normalizeManifestOptions(options.manifest, compilerName),
    runtimePlugins: prependRuntimePlugins(compilerName, options.runtimePlugins),
    dts: options.dts ?? false,
    shareStrategy: options.shareStrategy ?? 'loaded-first',
    experiments: {
      ...experiments,
      asyncStartup: true,
    },
  };
};

export class NextFederationPlugin {
  public readonly name = 'NextFederationPlugin';
  private readonly options: ValidNextFederationOptions;

  constructor(options: NextFederationPluginOptions) {
    assertValidOptions(options as LegacyNextFederationOptions);
    this.options = options as ValidNextFederationOptions;
  }

  apply(compiler: CompilerLike) {
    const compilerName = getCompilerName(compiler);

    if (!compilerName) {
      return;
    }

    normalizeCompiler(compiler, compilerName, this.options.name);
    if (!isAppDirectoryCompiler(compiler)) {
      applyAutomaticAssetAdaptation(compiler);
    }
    const normalizedOptions = normalizeOptionsForCompiler(
      this.options,
      compilerName,
    );
    if (compilerName === 'server') {
      applyServerCompilerEnhancements(compiler as never, normalizedOptions);
      patchServerExternals(compiler, normalizedOptions);
    } else {
      new PersistManifestAssetsPlugin(normalizedOptions.manifest).apply(
        compiler as never,
      );
    }

    new RspackModuleFederationPlugin(normalizedOptions).apply(
      compiler as never,
    );
  }
}

export default NextFederationPlugin;
