import type { Compiler, WebpackPluginInstance } from 'webpack';
import type { NextFederationPluginOptions } from './plugins/NextFederationPlugin/next-fragments';
import { createRequire } from 'module';
import path from 'path';

type NextFederationPluginCtor =
  typeof import('./plugins/NextFederationPlugin').default;
type NextFederationPluginModule =
  | NextFederationPluginCtor
  | {
      default?: NextFederationPluginCtor;
      NextFederationPlugin?: NextFederationPluginCtor;
    };

const loadNextFederationPlugin = (): NextFederationPluginCtor => {
  const pluginModule =
    require('./plugins/NextFederationPlugin') as NextFederationPluginModule;

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

let requireHookAliasPatched = false;

const getCwdRequire = () => {
  return createRequire(path.join(process.cwd(), 'package.json'));
};

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
    pushCandidate(createRequire(path.join(process.cwd(), 'package.json')));
  } catch {
    // cwd package.json may not exist in some script contexts
  }

  return candidates;
};

const resolveNextRequireHook = (): NextRequireHookModule | undefined => {
  try {
    const cwdRequire = getCwdRequire();
    const hookModule = cwdRequire(
      'next/dist/server/require-hook',
    ) as NextRequireHookModule;

    if (typeof hookModule?.addHookAliases === 'function') {
      return hookModule;
    }
  } catch {
    // continue to module-local and cache lookup
  }

  try {
    const hookModule =
      require('next/dist/server/require-hook') as NextRequireHookModule;

    if (typeof hookModule?.addHookAliases === 'function') {
      return hookModule;
    }
  } catch {
    // continue to cache and candidate lookup
  }

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
    const cwdRequire = getCwdRequire();

    try {
      return cwdRequire.resolve('webpack-sources');
    } catch {
      // continue to webpack-internal resolution
    }

    try {
      const { createRequire } = runtimeRequire(
        'module',
      ) as typeof import('module');
      const webpackConcatenatedModulePath = cwdRequire.resolve(
        'webpack/lib/optimize/ConcatenatedModule.js',
      );
      const webpackRequire = createRequire(webpackConcatenatedModulePath);
      return webpackRequire.resolve('webpack-sources');
    } catch {
      // continue to candidate search
    }

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

  return undefined;
};

const patchRequireHookWebpackSourcesAlias = () => {
  if (requireHookAliasPatched) {
    return;
  }

  const hookModule = resolveNextRequireHook();
  const hookPropertyMap = hookModule?.hookPropertyMap;

  if (!hookPropertyMap) {
    return;
  }

  const webpackSourcesAliasPath = resolveWebpackSourcesPath(hookPropertyMap);

  if (!webpackSourcesAliasPath) {
    return;
  }

  const patchedHookMap = hookPropertyMap as Map<string, string> & {
    __nextMfWebpackSourcesPatched?: boolean;
  };

  if (!patchedHookMap.__nextMfWebpackSourcesPatched) {
    const originalSet = hookPropertyMap.set.bind(hookPropertyMap);
    hookPropertyMap.set = ((request: string, replacement: string) => {
      if (
        webpackSourcesAliasKeys.includes(
          request as (typeof webpackSourcesAliasKeys)[number],
        )
      ) {
        return originalSet(request, webpackSourcesAliasPath);
      }

      return originalSet(request, replacement);
    }) as typeof hookPropertyMap.set;
    patchedHookMap.__nextMfWebpackSourcesPatched = true;
  }

  hookModule.addHookAliases?.(
    webpackSourcesAliasKeys.map((aliasKey) => [
      aliasKey,
      webpackSourcesAliasPath,
    ]),
  );
  requireHookAliasPatched = true;
};

export class NextFederationPlugin implements WebpackPluginInstance {
  private readonly options: NextFederationPluginOptions;
  private instance?: WebpackPluginInstance & { name?: string };
  public name = 'ModuleFederationPlugin';

  constructor(options: NextFederationPluginOptions) {
    this.options = options;
    patchRequireHookWebpackSourcesAlias();
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

patchRequireHookWebpackSourcesAlias();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = NextFederationPlugin;
  module.exports.NextFederationPlugin = NextFederationPlugin;
}
