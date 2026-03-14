import type { Compiler, WebpackPluginInstance } from 'webpack';
import type { NextFederationPluginOptions } from './plugins/NextFederationPlugin/next-fragments';
import path from 'path';

type NextFederationPluginCtor =
  typeof import('./plugins/NextFederationPlugin').default;
type NextFederationPluginModule =
  | NextFederationPluginCtor
  | {
      default?: NextFederationPluginCtor;
      NextFederationPlugin?: NextFederationPluginCtor;
    };

const runtimeRequireFromModule = new Function(
  'moduleRef',
  'id',
  'return moduleRef && moduleRef.require ? moduleRef.require(id) : undefined',
) as (moduleRef: { require(id: string): any } | undefined, id: string) => any;

const runtimeRequire = (id: string) =>
  runtimeRequireFromModule(
    typeof module !== 'undefined' ? module : undefined,
    id,
  );

const loadNextFederationPlugin = (): NextFederationPluginCtor => {
  const pluginModule = runtimeRequire(
    './plugins/NextFederationPlugin',
  ) as NextFederationPluginModule;

  if ((pluginModule as { default?: NextFederationPluginCtor }).default) {
    return (pluginModule as { default: NextFederationPluginCtor }).default;
  }

  if (
    (pluginModule as { NextFederationPlugin?: NextFederationPluginCtor })
      .NextFederationPlugin
  ) {
    return (pluginModule as { NextFederationPlugin: NextFederationPluginCtor })
      .NextFederationPlugin;
  }

  return pluginModule as NextFederationPluginCtor;
};

type NextRequireHookModule = {
  addHookAliases?: (aliases?: [string, string][]) => void;
  hookPropertyMap?: Map<string, string>;
};

type ModuleLike = {
  filename?: string;
  parent?: ModuleLike;
  require: ((id: string) => unknown) & {
    resolve?: (id: string) => string;
  };
};

const webpackSourcesAliasKeys = [
  'webpack-sources',
  'webpack-sources/lib',
  'webpack-sources/lib/index',
  'webpack-sources/lib/index.js',
] as const;

const webpackAliasKeys = ['webpack'] as const;
const nextCompiledWebpackAliasKeys = [
  'next/dist/compiled/webpack/webpack',
  'next/dist/compiled/webpack/webpack.js',
] as const;
const reactAliasKeys = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
] as const;

const collectRequireCandidates = (): ModuleLike['require'][] => {
  const candidates: ModuleLike['require'][] = [];
  const seen = new Set<ModuleLike['require']>();

  const pushCandidate = (candidate?: ModuleLike['require']) => {
    if (!candidate || seen.has(candidate)) {
      return;
    }
    seen.add(candidate);
    candidates.push(candidate);
  };

  let moduleRef = (typeof module !== 'undefined' ? module : undefined) as
    | ModuleLike
    | undefined;

  while (moduleRef) {
    pushCandidate(moduleRef.require);
    moduleRef = moduleRef.parent;
  }

  try {
    const { createRequire } = runtimeRequire(
      'module',
    ) as typeof import('module');
    pushCandidate(createRequire(path.join(process.cwd(), 'package.json')));
  } catch {
    // cwd package.json may not exist in some script contexts
  }

  return candidates;
};

const resolveNextRequireHook = (): NextRequireHookModule | undefined => {
  const cachedModule = Object.values(require.cache).find((entry) => {
    const fileName = entry?.filename;

    return (
      typeof fileName === 'string' &&
      fileName.includes(
        `${path.sep}next${path.sep}dist${path.sep}server${path.sep}require-hook`,
      )
    );
  });

  if (cachedModule?.exports) {
    const cachedExports = cachedModule.exports as NextRequireHookModule;
    if (typeof cachedExports.addHookAliases === 'function') {
      return cachedExports;
    }
  }

  for (const requireCandidate of collectRequireCandidates()) {
    try {
      const hookModule = requireCandidate(
        'next/dist/server/require-hook',
      ) as NextRequireHookModule;

      if (typeof hookModule?.addHookAliases === 'function') {
        return hookModule;
      }
    } catch {
      // continue searching through remaining require candidates
    }
  }

  return undefined;
};

const resolveWebpackSourcesPath = (
  hookPropertyMap: Map<string, string>,
): string | undefined => {
  const previousAliases = new Map<string, string | undefined>();
  for (const aliasKey of webpackSourcesAliasKeys) {
    previousAliases.set(aliasKey, hookPropertyMap.get(aliasKey));
    hookPropertyMap.delete(aliasKey);
  }

  try {
    const { createRequire } = runtimeRequire(
      'module',
    ) as typeof import('module');

    for (const requireCandidate of collectRequireCandidates()) {
      if (typeof requireCandidate.resolve !== 'function') {
        continue;
      }

      try {
        const resolvedWebpackSources =
          requireCandidate.resolve('webpack-sources');
        if (resolvedWebpackSources) {
          return resolvedWebpackSources;
        }
      } catch {
        // continue to webpack-internal resolution
      }

      try {
        const webpackConcatenatedModulePath = requireCandidate.resolve(
          'webpack/lib/optimize/ConcatenatedModule.js',
        );
        const webpackRequire = createRequire(webpackConcatenatedModulePath);
        const resolvedWebpackSources =
          webpackRequire.resolve('webpack-sources');
        if (resolvedWebpackSources) {
          return resolvedWebpackSources;
        }
      } catch {
        // continue to next candidate
      }
    }
  } finally {
    for (const aliasKey of webpackSourcesAliasKeys) {
      const previousAlias = previousAliases.get(aliasKey);
      if (previousAlias) {
        hookPropertyMap.set(aliasKey, previousAlias);
      } else {
        hookPropertyMap.delete(aliasKey);
      }
    }
  }

  try {
    return require.resolve('./plugins/NextFederationPlugin/webpack-sources-shim.js');
  } catch {
    return undefined;
  }
};

const resolveWebpackPath = (
  hookPropertyMap: Map<string, string>,
): string | undefined => {
  const previousAliases = new Map<string, string | undefined>();
  for (const aliasKey of webpackAliasKeys) {
    previousAliases.set(aliasKey, hookPropertyMap.get(aliasKey));
    hookPropertyMap.delete(aliasKey);
  }

  try {
    for (const requireCandidate of collectRequireCandidates()) {
      if (typeof requireCandidate.resolve !== 'function') {
        continue;
      }

      try {
        const resolvedWebpackPath = requireCandidate.resolve('webpack');
        if (resolvedWebpackPath) {
          return resolvedWebpackPath;
        }
      } catch {
        // continue to next candidate
      }
    }
  } finally {
    for (const aliasKey of webpackAliasKeys) {
      const previousAlias = previousAliases.get(aliasKey);
      if (previousAlias) {
        hookPropertyMap.set(aliasKey, previousAlias);
      } else {
        hookPropertyMap.delete(aliasKey);
      }
    }
  }

  return undefined;
};

const resolveRequestPath = (request: string): string | undefined => {
  for (const requireCandidate of collectRequireCandidates()) {
    if (typeof requireCandidate.resolve !== 'function') {
      continue;
    }

    try {
      const resolvedPath = requireCandidate.resolve(request);
      if (resolvedPath) {
        return resolvedPath;
      }
    } catch {
      // continue to next candidate
    }
  }

  return undefined;
};

const patchRequireHookWebpackSourcesAlias = () => {
  const globalState = globalThis as typeof globalThis & {
    __NEXT_MF_WEBPACK_SOURCES_ALIAS_PATCHED__?: boolean;
    __NEXT_MF_LOCAL_WEBPACK_PATH__?: string;
  };

  if (globalState.__NEXT_MF_WEBPACK_SOURCES_ALIAS_PATCHED__) {
    return;
  }

  const hookModule = resolveNextRequireHook();
  const hookPropertyMap = hookModule?.hookPropertyMap;

  if (!hookPropertyMap) {
    return;
  }

  const webpackSourcesAliasPath = resolveWebpackSourcesPath(hookPropertyMap);
  const webpackAliasPath = resolveWebpackPath(hookPropertyMap);
  const reactAliasEntries = reactAliasKeys
    .map((aliasKey) => [aliasKey, resolveRequestPath(aliasKey)] as const)
    .filter((entry): entry is [string, string] => Boolean(entry[1]));
  const reactAliasMap = new Map(reactAliasEntries);
  let nextCompiledWebpackShimPath: string | undefined;

  if (webpackAliasPath) {
    globalState.__NEXT_MF_LOCAL_WEBPACK_PATH__ = webpackAliasPath;
    try {
      nextCompiledWebpackShimPath =
        require.resolve('./plugins/NextFederationPlugin/next-compiled-webpack-shim.js');
    } catch {
      nextCompiledWebpackShimPath = undefined;
    }
  }

  if (!webpackSourcesAliasPath && !nextCompiledWebpackShimPath) {
    return;
  }

  const patchedHookMap = hookPropertyMap as Map<string, string> & {
    __nextMfSetPatched?: boolean;
  };

  if (!patchedHookMap.__nextMfSetPatched) {
    const originalSet = hookPropertyMap.set.bind(hookPropertyMap);
    hookPropertyMap.set = ((request: string, replacement: string) => {
      if (
        webpackSourcesAliasPath &&
        webpackSourcesAliasKeys.includes(
          request as (typeof webpackSourcesAliasKeys)[number],
        )
      ) {
        return originalSet(request, webpackSourcesAliasPath);
      }

      if (
        nextCompiledWebpackShimPath &&
        nextCompiledWebpackAliasKeys.includes(
          request as (typeof nextCompiledWebpackAliasKeys)[number],
        )
      ) {
        return originalSet(request, nextCompiledWebpackShimPath);
      }

      if (reactAliasMap.has(request)) {
        return originalSet(request, reactAliasMap.get(request)!);
      }

      return originalSet(request, replacement);
    }) as typeof hookPropertyMap.set;
    patchedHookMap.__nextMfSetPatched = true;
  }

  hookModule?.addHookAliases?.([
    ...webpackSourcesAliasKeys
      .filter(() => Boolean(webpackSourcesAliasPath))
      .map((aliasKey) => [aliasKey, webpackSourcesAliasPath!]),
    ...nextCompiledWebpackAliasKeys
      .filter(() => Boolean(nextCompiledWebpackShimPath))
      .map((aliasKey) => [aliasKey, nextCompiledWebpackShimPath!]),
    ...reactAliasEntries,
  ]);

  globalState.__NEXT_MF_WEBPACK_SOURCES_ALIAS_PATCHED__ = true;
};

export class NextFederationPlugin implements WebpackPluginInstance {
  private readonly options: NextFederationPluginOptions;
  private instance?: WebpackPluginInstance & { name?: string };
  public name = 'ModuleFederationPlugin';

  constructor(options: NextFederationPluginOptions) {
    this.options = options;
  }

  private getInstance(): WebpackPluginInstance & { name?: string } {
    if (!this.instance) {
      const RealNextFederationPlugin = loadNextFederationPlugin();
      this.instance = new RealNextFederationPlugin(
        this.options,
      ) as WebpackPluginInstance & { name?: string };
      this.name = this.instance.name ?? this.name;
    }

    return this.instance;
  }

  apply(compiler: Compiler) {
    return this.getInstance().apply(compiler);
  }
}

export default NextFederationPlugin;

if (
  process.env['IS_ESM_BUILD'] !== 'true' &&
  typeof module !== 'undefined' &&
  typeof module.exports !== 'undefined'
) {
  patchRequireHookWebpackSourcesAlias();
  module.exports = NextFederationPlugin;
  module.exports.NextFederationPlugin = NextFederationPlugin;
}
