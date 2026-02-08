import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import type { NextConfig } from 'next';
import type { Configuration, WebpackPluginInstance } from 'webpack';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import {
  assertLocalWebpackEnabled,
  assertWebpackBuildInvocation,
  isNextBuildOrDevCommand,
  normalizeNextFederationOptions,
  resolveFederationRemotes,
} from './core/options';
import {
  assertModeRouterCompatibility,
  assertUnsupportedAppRouterTargets,
  detectRouterPresence,
} from './core/features/app';
import { buildPagesExposes } from './core/features/pages';
import { buildSharedConfig } from './core/sharing';
import { buildRuntimePlugins } from './core/runtime';
import { applyFederatedAssetLoaderFixes } from './core/loaders/patchLoaders';
import { configureServerCompiler } from './core/compilers/server';
import { configureClientCompiler } from './core/compilers/client';
import type {
  NextFederationCompilerContext,
  NextFederationOptionsV9,
} from './types';

interface NextWebpackContext {
  dir: string;
  isServer: boolean;
  nextRuntime?: 'nodejs' | 'edge';
  webpack?: (...args: unknown[]) => unknown;
}

function isTruthy(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function getModuleFederationPluginCtor() {
  const enhancedWebpack =
    require('@module-federation/enhanced/webpack') as typeof import('@module-federation/enhanced/webpack');
  return enhancedWebpack.ModuleFederationPlugin;
}

function resolveWebpackFromNodeModules(root: string): string {
  const webpackDir = path.join(root, 'node_modules', 'webpack');

  try {
    const webpackRealPath = fs.realpathSync(webpackDir);
    const libIndexPath = path.join(webpackRealPath, 'lib', 'index.js');
    if (fs.existsSync(libIndexPath)) {
      return libIndexPath;
    }
  } catch {
    return '';
  }

  return '';
}

function resolveLocalWebpackPath(contextDir?: string): string {
  const entryRoots = [contextDir, process.cwd()].filter(
    (candidate): candidate is string => Boolean(candidate),
  );
  const searchRoots: string[] = [];
  const seenRoots = new Set<string>();

  for (const entryRoot of entryRoots) {
    let currentRoot = path.resolve(entryRoot);

    while (!seenRoots.has(currentRoot)) {
      seenRoots.add(currentRoot);
      searchRoots.push(currentRoot);

      const parentRoot = path.dirname(currentRoot);
      if (parentRoot === currentRoot) {
        break;
      }
      currentRoot = parentRoot;
    }
  }

  for (const root of searchRoots) {
    const fsResolvedPath = resolveWebpackFromNodeModules(root);
    if (fsResolvedPath) {
      return fsResolvedPath;
    }

    try {
      const requireFromRoot = createRequire(path.join(root, 'package.json'));
      return requireFromRoot.resolve('webpack');
    } catch (_error) {
      continue;
    }
  }

  try {
    return require.resolve('webpack');
  } catch (_error) {
    return '';
  }
}

function patchNextRequireHookForLocalWebpack(contextDir?: string): void {
  if (!isTruthy(process.env['NEXT_PRIVATE_LOCAL_WEBPACK'])) {
    return;
  }

  const localWebpackPath = resolveLocalWebpackPath(contextDir);
  if (!localWebpackPath) {
    return;
  }

  const webpackRoot = path.dirname(path.dirname(localWebpackPath));
  let webpackSourcesPath = '';
  const webpackSourcesFsCandidate = path.join(
    webpackRoot,
    '..',
    'webpack-sources',
    'lib',
    'index.js',
  );

  try {
    const requireFromWebpack = createRequire(
      path.join(webpackRoot, 'package.json'),
    );
    webpackSourcesPath = requireFromWebpack.resolve('webpack-sources');
  } catch {
    return;
  }

  // eslint-disable-next-line no-console
  console.error('[nextjs-mf debug] localWebpackPath =', localWebpackPath);
  // eslint-disable-next-line no-console
  console.error(
    '[nextjs-mf debug] webpackSourcesFsCandidate =',
    webpackSourcesFsCandidate,
    fs.existsSync(webpackSourcesFsCandidate),
  );

  const aliases: [string, string][] = [
    ['webpack-sources', webpackSourcesPath],
    ['webpack-sources/lib', webpackSourcesPath],
    ['webpack-sources/lib/index', webpackSourcesPath],
    ['webpack-sources/lib/index.js', webpackSourcesPath],
  ];

  const requireBaseDirs = [contextDir, process.cwd()].filter(
    (candidate): candidate is string => Boolean(candidate),
  );

  for (const requireBaseDir of requireBaseDirs) {
    try {
      const requireFromBase = createRequire(
        path.join(requireBaseDir, 'package.json'),
      );
      const hook = requireFromBase('next/dist/server/require-hook') as {
        addHookAliases?: (aliases: [string, string][]) => void;
        hookPropertyMap?: Map<string, string>;
      };
      hook.addHookAliases?.(aliases);
      // eslint-disable-next-line no-console
      console.error(
        '[nextjs-mf debug] webpack-sources alias after patch =',
        hook.hookPropertyMap?.get('webpack-sources'),
      );
    } catch {
      // ignore missing hooks for this base dir
    }
  }
}

function ensureFederationWebpackPath(context: NextWebpackContext): void {
  if (process.env['FEDERATION_WEBPACK_PATH']) {
    return;
  }

  let inferredPath = '';
  const localWebpackPath = resolveLocalWebpackPath(context.dir);

  if (typeof context.webpack === 'function') {
    inferredPath = getWebpackPath(
      { webpack: context.webpack } as unknown as import('webpack').Compiler,
      { framework: 'nextjs' },
    );
  }

  process.env['FEDERATION_WEBPACK_PATH'] =
    localWebpackPath ||
    inferredPath ||
    process.env['FEDERATION_WEBPACK_PATH'] ||
    '';
}

function inferCompilerName(
  config: Configuration,
  context: NextWebpackContext,
): string {
  if (typeof config.name === 'string' && config.name.length > 0) {
    return config.name;
  }

  if (!context.isServer) {
    return 'client';
  }

  return context.nextRuntime === 'edge' ? 'edge-server' : 'server';
}

function toCompilerContext(
  compilerName: string,
  context: NextWebpackContext,
): NextFederationCompilerContext {
  return {
    isServer: compilerName === 'server',
    nextRuntime: context.nextRuntime,
    compilerName,
  };
}

function applyPlugin(
  config: Configuration,
  plugin: WebpackPluginInstance,
): void {
  const plugins = config.plugins || [];
  plugins.push(plugin);
  config.plugins = plugins;
}

function normalizeOutputPath(config: Configuration): void {
  if (!config.output) {
    config.output = {};
  }

  if (!config.output.path) {
    config.output.path = path.resolve(process.cwd(), '.next');
  }
}

function normalizeExposes(
  exposes: moduleFederationPlugin.ModuleFederationPluginOptions['exposes'],
): Record<string, unknown> {
  if (!exposes || Array.isArray(exposes)) {
    return {};
  }

  return exposes as Record<string, unknown>;
}

export function withNextFederation(
  nextConfig: NextConfig,
  federationOptions: NextFederationOptionsV9,
): NextConfig {
  patchNextRequireHookForLocalWebpack(process.cwd());
  assertWebpackBuildInvocation();
  if (isNextBuildOrDevCommand()) {
    assertLocalWebpackEnabled();
  }

  const resolved = normalizeNextFederationOptions(federationOptions);
  const userWebpack = nextConfig.webpack;
  let hasValidatedAppExposes = false;

  return {
    ...nextConfig,
    webpack(config: Configuration, context: NextWebpackContext): Configuration {
      patchNextRequireHookForLocalWebpack(
        context.dir || (config.context as string | undefined) || process.cwd(),
      );

      const userConfig =
        typeof userWebpack === 'function'
          ? (userWebpack(config, context as never) as Configuration) || config
          : config;

      normalizeOutputPath(userConfig);

      const compilerName = inferCompilerName(userConfig, context);

      if (compilerName === 'edge-server' || context.nextRuntime === 'edge') {
        // v9 intentionally skips federation in edge compiler.
        return userConfig;
      }

      ensureFederationWebpackPath(context);
      applyFederatedAssetLoaderFixes(userConfig);

      const cwd = context.dir || userConfig.context || process.cwd();

      const routerPresence = detectRouterPresence(cwd);
      assertModeRouterCompatibility(resolved.mode, routerPresence.hasApp);

      if (
        !hasValidatedAppExposes &&
        (resolved.mode === 'app' || resolved.mode === 'hybrid')
      ) {
        assertUnsupportedAppRouterTargets(cwd, resolved.federation.exposes);
        hasValidatedAppExposes = true;
      }

      const federationContext = toCompilerContext(compilerName, context);
      const isServer = federationContext.isServer;

      const remotes = resolveFederationRemotes(resolved, federationContext);
      const pagesExposes = resolved.pages.exposePages
        ? buildPagesExposes(cwd, resolved.pages.pageMapFormat)
        : {};
      const shared = buildSharedConfig(
        resolved,
        isServer,
        resolved.federation.shared,
      );
      const mergedExposes = {
        ...normalizeExposes(resolved.federation.exposes),
        ...pagesExposes,
      } as moduleFederationPlugin.ModuleFederationPluginOptions['exposes'];

      const nextFederationConfig: moduleFederationPlugin.ModuleFederationPluginOptions =
        {
          ...resolved.federation,
          runtime: false,
          filename: resolved.filename,
          remotes,
          exposes: mergedExposes,
          shared,
          remoteType: 'script' as const,
          runtimePlugins: buildRuntimePlugins(resolved, isServer),
          dts: resolved.federation.dts ?? false,
          shareStrategy: resolved.sharing.strategy,
          experiments: {
            asyncStartup: true,
            ...(resolved.federation.experiments || {}),
          },
          manifest: isServer
            ? { filePath: '' }
            : { filePath: '/static/chunks' },
        };

      if (isServer) {
        configureServerCompiler(userConfig, nextFederationConfig);
      } else {
        configureClientCompiler(userConfig, nextFederationConfig);
      }

      const ModuleFederationPlugin = getModuleFederationPluginCtor();
      applyPlugin(userConfig, new ModuleFederationPlugin(nextFederationConfig));

      return userConfig;
    },
  };
}

export default withNextFederation;
