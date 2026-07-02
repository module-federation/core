import { createRequire } from 'node:module';
import { describe, expect, it } from '@rstest/core';
import type {
  EnvironmentConfig,
  RsbuildPluginAPI,
  Rspack,
} from '@rsbuild/core';

import { shouldKeepBundledForFederation } from './externals-bypass';
import { FEDERATION_PLUGIN_NAME, federation } from './index';
import type { ModuleFederationOptions } from './types';

const require = createRequire(import.meta.url);
const NODE_RUNTIME_PLUGIN_REQUEST = '@module-federation/node/runtimePlugin';
const NODE_RUNTIME_PLUGIN = require.resolve(NODE_RUNTIME_PLUGIN_REQUEST);

type FederationPlugin = ReturnType<typeof federation>;

type MergeEnvironmentConfig = (
  ...configs: EnvironmentConfig[]
) => EnvironmentConfig;

type EnvHook = (
  config: EnvironmentConfig,
  utils: { mergeEnvironmentConfig: MergeEnvironmentConfig },
) => EnvironmentConfig;

type EnvHookDescriptor =
  | EnvHook
  | { handler: EnvHook; order?: 'pre' | 'post' | 'default' };

// Loose rspack-config shape for tests: real Rspack.Configuration rejects the
// fake plugin objects the tests construct, so the cast to the real type
// happens once, at the hook boundary in runRspackHooks.
type TestRspackConfig = {
  target?: unknown;
  output?: { module?: boolean };
  optimization?: { splitChunks?: unknown };
  experiments?: { outputModule?: boolean };
  externals?: unknown[];
  plugins?: unknown[];
};

type ExternalFunction = (
  data: { request?: string },
  callback: (err?: Error, result?: unknown) => void,
) => void;

const getExternalBypass = (config: TestRspackConfig): ExternalFunction => {
  expect(Array.isArray(config.externals)).toBe(true);
  const fn = config.externals?.[0];
  expect(typeof fn).toBe('function');
  return fn as ExternalFunction;
};

const callExternal = (fn: ExternalFunction, request: string): unknown => {
  let result: unknown = 'unset';
  fn({ request }, (_err, res) => {
    result = res;
  });
  return result;
};

// The plugin instances pushed into rspackConfig.plugins by the federation
// plugin. `_options` is the private field of ModuleFederationPlugin; the
// tests read it the same way `remotes.ts` does.
type ModuleFederationPluginInstance = {
  constructor?: { name?: string };
  _options?: ModuleFederationOptions;
  options?: ModuleFederationOptions;
};

const shallowMergeEnvironmentConfig: MergeEnvironmentConfig = (...configs) =>
  Object.assign({}, ...configs);

const getFederationPluginOptions = (
  plugins: unknown[] | undefined,
): ModuleFederationOptions => {
  const plugin = (plugins ?? []).find(
    (item): item is ModuleFederationPluginInstance =>
      (item as ModuleFederationPluginInstance | undefined)?.constructor
        ?.name === 'ModuleFederationPlugin',
  );
  expect(plugin).toBeTruthy();
  const options = plugin!._options ?? plugin!.options;
  expect(options).toBeTruthy();
  return options!;
};

// Minimal Rsbuild API surface used by the plugin. rstest sets callerName to
// 'rstest' (node) or 'rstest-browser' (browser) on its Rsbuild instances.
const setupFederationPlugin = (
  plugin: FederationPlugin,
  callerName = 'rstest',
): { envHook: EnvHook; order: unknown } => {
  let envHook: EnvHook | undefined;
  let order: unknown;

  const fakeApi = {
    context: { callerName },
    modifyEnvironmentConfig: (hook: EnvHookDescriptor) => {
      if (typeof hook === 'function') {
        envHook = hook;
      } else {
        envHook = hook.handler;
        order = hook.order;
      }
    },
  };

  plugin.setup(fakeApi as unknown as RsbuildPluginAPI);

  expect(typeof envHook).toBe('function');
  return { envHook: envHook!, order };
};

const runRspackHooks = (
  merged: EnvironmentConfig,
  rspackConfig: TestRspackConfig,
): void => {
  const registered = merged.tools?.rspack;
  const hooks = Array.isArray(registered) ? registered : [registered];
  for (const hook of hooks) {
    if (typeof hook === 'function') {
      (hook as (cfg: TestRspackConfig, utils: unknown) => void)(
        rspackConfig,
        {},
      );
    }
  }
};

// Runs the plugin's environment hook and every registered tools.rspack hook
// against the provided rspack config, mirroring what Rsbuild does.
const applyFederationPlugin = (
  plugin: FederationPlugin,
  {
    callerName = 'rstest',
    config = {},
    mergeEnvironmentConfig = shallowMergeEnvironmentConfig,
    rspackConfig = { output: {}, plugins: [] },
  }: {
    callerName?: string;
    config?: EnvironmentConfig;
    mergeEnvironmentConfig?: MergeEnvironmentConfig;
    rspackConfig?: TestRspackConfig;
  } = {},
) => {
  const { envHook } = setupFederationPlugin(plugin, callerName);
  const merged = envHook(config, { mergeEnvironmentConfig });

  runRspackHooks(merged, rspackConfig);

  return { merged, rspackConfig };
};

const captureWarnings = (run: () => void): string[] => {
  const consoleWithWarn = console as typeof console & {
    warn: (...args: unknown[]) => void;
  };
  const originalWarn = consoleWithWarn.warn;
  const warnings: string[] = [];

  consoleWithWarn.warn = (...args: unknown[]) => {
    warnings.push(args.map((arg) => String(arg)).join(' '));
  };

  try {
    run();
  } finally {
    consoleWithWarn.warn = originalWarn;
  }

  return warnings;
};

describe('shouldKeepBundledForFederation', () => {
  it('keeps loader-style data: javascript requests bundled', () => {
    expect(
      shouldKeepBundledForFederation(
        'something!=!data:text/javascript,console.log(1)',
      ),
    ).toBe(true);
  });

  it('keeps @module-federation/* requests bundled', () => {
    expect(shouldKeepBundledForFederation('@module-federation/node')).toBe(
      true,
    );
  });

  it('keeps the resolved node runtime plugin path bundled', () => {
    expect(
      shouldKeepBundledForFederation(
        require.resolve('@module-federation/node/runtimePlugin'),
      ),
    ).toBe(true);
  });

  it('keeps webpack container reference requests bundled', () => {
    expect(
      shouldKeepBundledForFederation(
        'webpack/container/reference/component-app',
      ),
    ).toBe(true);
  });

  it('keeps requests that match discovered remote names bundled', () => {
    const remoteNames = new Set<string>(['component-app']);
    expect(
      shouldKeepBundledForFederation('component-app/Button', remoteNames),
    ).toBe(true);
  });

  it('keeps requests that match remote@entry-url shape bundled', () => {
    const remoteNames = new Set<string>(['component-app']);
    expect(
      shouldKeepBundledForFederation(
        'component-app@http://localhost:3001/mf-manifest.json',
        remoteNames,
      ),
    ).toBe(true);
  });

  it('does not keep unrelated packages bundled', () => {
    expect(shouldKeepBundledForFederation('react')).toBe(false);
  });
});

describe('federation()', () => {
  it('uses the stable public plugin name', () => {
    expect(FEDERATION_PLUGIN_NAME).toBe('rstest:federation');
    expect(federation().name).toBe('rstest:federation');
  });

  it('registers modifyEnvironmentConfig with post order', () => {
    const { order } = setupFederationPlugin(federation());
    expect(order).toBe('post');
  });

  it('patches rspack config to force CJS output in node/jsdom workers', () => {
    const { merged, rspackConfig } = applyFederationPlugin(federation());

    expect(merged.output?.target).toBe('node');
    expect(rspackConfig.target).toBe('async-node');
    expect(rspackConfig.optimization?.splitChunks).toBe(false);
    expect(rspackConfig.experiments?.outputModule).toBe(false);
    expect(rspackConfig.output?.module).toBe(false);
  });

  it('keeps federation remote requests bundled via externals bypass', () => {
    const { rspackConfig } = applyFederationPlugin(federation(), {
      rspackConfig: {
        output: {},
        externals: ['react'],
        plugins: [
          {
            constructor: { name: 'ModuleFederationPlugin' },
            _options: {
              remotes: {
                'component-app':
                  'component_app@http://localhost:3001/remoteEntry.js',
              },
              experiments: {
                optimization: {
                  target: 'node',
                },
              },
            },
          },
        ],
      },
    });

    const bypass = getExternalBypass(rspackConfig);
    expect(callExternal(bypass, 'component-app/Button')).toBe(false);
    expect(callExternal(bypass, 'react')).toBe(undefined);
  });

  it('auto-applies ModuleFederationPlugin with node defaults', () => {
    const { rspackConfig } = applyFederationPlugin(
      federation({
        name: 'main_app_web',
        remotes: {
          'component-app': 'component_app@http://localhost:3001/remoteEntry.js',
        },
        shared: {
          react: { singleton: true },
        },
      }),
    );

    expect(rspackConfig.target).toBe('async-node');
    expect(rspackConfig.optimization?.splitChunks).toBe(false);
    expect(rspackConfig.experiments?.outputModule).toBe(false);
    expect(rspackConfig.output?.module).toBe(false);

    const options = getFederationPluginOptions(rspackConfig.plugins);
    expect(options!.name).toBe('main_app_web');
    expect(options!.library?.type).toBe('commonjs-module');
    expect(options!.library?.name).toBe('main_app_web');
    expect(options!.remoteType).toBe(undefined);
    expect(options!.runtimePlugins).toEqual([NODE_RUNTIME_PLUGIN]);
    expect(options!.experiments?.asyncStartup).toBe(true);
    expect(options!.experiments?.optimization?.target).toBe('node');
  });

  it('disables dts, manifest, and dev machinery by default', () => {
    const { rspackConfig } = applyFederationPlugin(
      federation({ name: 'defaults_off_app' }),
    );

    const options = getFederationPluginOptions(rspackConfig.plugins);
    expect(options!.dts).toBe(false);
    expect(options!.manifest).toBe(false);
    expect(options!.dev).toBe(false);
  });

  it('disables dts, manifest, and dev by default for browser target too', () => {
    const { rspackConfig } = applyFederationPlugin(
      federation({ name: 'browser_defaults_off_app' }, { target: 'browser' }),
    );

    const options = getFederationPluginOptions(rspackConfig.plugins);
    expect(options!.dts).toBe(false);
    expect(options!.manifest).toBe(false);
    expect(options!.dev).toBe(false);
  });

  it('preserves explicit dts, manifest, and dev values', () => {
    const { rspackConfig } = applyFederationPlugin(
      federation({
        name: 'defaults_on_app',
        dts: true,
        manifest: { filePath: 'custom' },
        dev: true,
      }),
    );

    const options = getFederationPluginOptions(rspackConfig.plugins);
    expect(options!.dts).toBe(true);
    expect(options!.manifest).toEqual({ filePath: 'custom' });
    expect(options!.dev).toBe(true);
  });

  it('preserves user overrides while still injecting node runtime plugin', () => {
    let options: ModuleFederationOptions | undefined;
    const warnings = captureWarnings(() => {
      const { rspackConfig } = applyFederationPlugin(
        federation({
          name: 'component_app',
          remotes: {
            host: 'host@http://localhost:3000/remoteEntry.js',
          },
          remoteType: 'commonjs',
          library: {
            type: 'var',
            name: 'custom_library_name',
          },
          runtimePlugins: ['custom/runtimePlugin'],
          experiments: {
            optimization: {
              target: 'node',
            },
          },
        }),
      );
      options = getFederationPluginOptions(rspackConfig.plugins);
    });

    expect(options!.remoteType).toBe('commonjs');
    expect(options!.library?.type).toBe('var');
    expect(options!.library?.name).toBe('component_app');
    expect(options!.experiments?.asyncStartup).toBe(true);
    expect(options!.runtimePlugins).toEqual([
      NODE_RUNTIME_PLUGIN,
      'custom/runtimePlugin',
    ]);
    expect(warnings.join('\n')).toContain(
      'library.name "custom_library_name" is overridden with the container name "component_app"',
    );
  });

  it('forces node optimization target even when configured otherwise', () => {
    let options: ModuleFederationOptions | undefined;
    const warnings = captureWarnings(() => {
      const { rspackConfig } = applyFederationPlugin(
        federation({
          name: 'component_app',
          experiments: {
            optimization: {
              target: 'web',
            },
          },
        }),
      );
      options = getFederationPluginOptions(rspackConfig.plugins);
    });

    expect(options!.experiments?.optimization?.target).toBe('node');
    expect(warnings.join('\n')).toContain(
      'experiments.optimization.target "web" is overridden with "node"',
    );
  });

  it('forces async startup and warns when disabled manually', () => {
    let options: ModuleFederationOptions | undefined;
    const warnings = captureWarnings(() => {
      const { rspackConfig } = applyFederationPlugin(
        federation({
          name: 'legacy_component_app',
          experiments: {
            asyncStartup: false,
          },
        }),
      );
      options = getFederationPluginOptions(rspackConfig.plugins);
    });

    expect(options!.experiments?.asyncStartup).toBe(true);
    expect(warnings.join('\n')).toContain(
      'experiments.asyncStartup was set to false but is forced to true',
    );
  });

  it('warns when the node runtime plugin is configured manually', () => {
    let options: ModuleFederationOptions | undefined;
    const warnings = captureWarnings(() => {
      const { rspackConfig } = applyFederationPlugin(
        federation({
          name: 'legacy_component_app',
          runtimePlugins: [NODE_RUNTIME_PLUGIN_REQUEST],
          experiments: {
            optimization: {
              target: 'node',
            },
          },
        }),
      );
      options = getFederationPluginOptions(rspackConfig.plugins);
    });

    expect(options!.runtimePlugins).toEqual([NODE_RUNTIME_PLUGIN]);
    expect(warnings.join('\n')).toContain(
      'manual configuration is unnecessary',
    );
  });

  it('warns when running outside rstest', () => {
    const warnings = captureWarnings(() => {
      setupFederationPlugin(federation(), 'rsbuild');
    });

    expect(warnings.join('\n')).toContain(
      'designed to run under rstest, but the current caller is "rsbuild"',
    );
  });

  it('does not warn about the caller under rstest runners', () => {
    for (const callerName of ['rstest', 'rstest-browser']) {
      const warnings = captureWarnings(() => {
        setupFederationPlugin(federation(), callerName);
      });

      expect(warnings.join('\n')).not.toContain('designed to run under rstest');
    }
  });

  it('defaults to browser target when called from rstest-browser', () => {
    const { merged, rspackConfig } = applyFederationPlugin(
      federation({ name: 'browser_caller_app' }),
      { callerName: 'rstest-browser' },
    );

    expect(merged.output?.target).not.toBe('node');
    expect(rspackConfig.target).toBe(undefined);
    expect(rspackConfig.output?.module).toBe(undefined);

    const options = getFederationPluginOptions(rspackConfig.plugins);
    expect(options!.library).toBe(undefined);
    expect(options!.runtimePlugins).toBe(undefined);
  });

  it('lets an explicit node target win over the rstest-browser caller', () => {
    const { merged, rspackConfig } = applyFederationPlugin(
      federation({ name: 'forced_node_app' }, { target: 'node' }),
      { callerName: 'rstest-browser' },
    );

    expect(merged.output?.target).toBe('node');
    expect(rspackConfig.target).toBe('async-node');
    expect(rspackConfig.output?.module).toBe(false);
  });

  it('supports browser target without node-specific rspack patches', () => {
    const { merged, rspackConfig } = applyFederationPlugin(
      federation(
        {
          name: 'browser_app',
          remotes: {
            provider: 'provider@http://localhost:4001/remoteEntry.js',
          },
        },
        {
          target: 'browser',
        },
      ),
    );

    expect(merged.output?.target).not.toBe('node');
    expect(rspackConfig.target).toBe(undefined);
    expect(rspackConfig.optimization?.splitChunks).toBe(undefined);
    expect(rspackConfig.experiments?.outputModule).toBe(undefined);
    expect(rspackConfig.output?.module).toBe(undefined);

    const options = getFederationPluginOptions(rspackConfig.plugins);
    expect(options!.remoteType).toBe(undefined);
    expect(options!.library).toBe(undefined);
    expect(options!.runtimePlugins).toBe(undefined);
    expect(options!.experiments?.asyncStartup).toBe(true);
  });

  it('does not force remoteType when remotes are configured', () => {
    const { rspackConfig } = applyFederationPlugin(
      federation({
        name: 'prefixed_commonjs_remote',
        remotes: {
          host: 'commonjs /tmp/remoteEntry.js',
        },
      }),
    );

    const options = getFederationPluginOptions(rspackConfig.plugins);
    expect(options!.remoteType).toBe(undefined);
  });

  it('does not force remoteType when no remotes are configured', () => {
    const { rspackConfig } = applyFederationPlugin(
      federation({
        name: 'no_remotes',
        shared: {
          react: { singleton: true },
        },
      }),
    );

    const options = getFederationPluginOptions(rspackConfig.plugins);
    expect(options!.remoteType).toBe(undefined);
  });

  it('collects remote names from string remotes (mf-manifest) and bypasses externals', () => {
    const { rspackConfig } = applyFederationPlugin(federation(), {
      rspackConfig: {
        output: {},
        externals: [],
        plugins: [
          {
            constructor: { name: 'ModuleFederationPlugin' },
            _options: {
              remotes: ['component-app@http://localhost:3001/mf-manifest.json'],
              experiments: {
                optimization: {
                  target: 'node',
                },
              },
            },
          },
        ],
      },
    });

    const bypass = getExternalBypass(rspackConfig);
    expect(callExternal(bypass, 'component-app/Button')).toBe(false);
  });

  it('composes with existing tools.rspack hook instead of overwriting it', () => {
    const mergeEnvironmentConfig: MergeEnvironmentConfig = (...configs) => {
      // Basic merge that preserves nested objects we care about for this test.
      const out: EnvironmentConfig = {};
      for (const c of configs) {
        if (!c) continue;
        if (c.output) out.output = { ...out.output, ...c.output };
        if (c.tools) out.tools = { ...out.tools, ...c.tools };
      }
      return out;
    };

    const existingHook = (cfg: Rspack.Configuration) => {
      (
        cfg as TestRspackConfig & { __existingHookRan?: boolean }
      ).__existingHookRan = true;
    };

    const { envHook } = setupFederationPlugin(federation());
    const merged = envHook(
      { tools: { rspack: existingHook } },
      { mergeEnvironmentConfig },
    );

    expect(Array.isArray(merged.tools?.rspack)).toBe(true);

    const rspackConfig: TestRspackConfig & { __existingHookRan?: boolean } = {
      output: {},
      plugins: [],
    };
    runRspackHooks(merged, rspackConfig);

    expect(rspackConfig.__existingHookRan).toBe(true);
    expect(rspackConfig.experiments?.outputModule).toBe(false);
    expect(rspackConfig.output?.module).toBe(false);
  });
});
