import { createRequire } from 'node:module';
import {
  ModuleFederationPlugin,
  PLUGIN_NAME,
} from '@module-federation/enhanced/rspack';
import { describe, expect, it, rs } from '@rstest/core';
import {
  mergeRsbuildConfig,
  type EnvironmentConfig,
  type RsbuildPluginAPI,
  type Rspack,
} from '@rsbuild/core';
import {
  RSBUILD_PLUGIN_MODULE_FEDERATION_NAME,
  type ExposedAPIType as RsbuildFederationExposeAPI,
} from '@module-federation/rsbuild-plugin';

import { shouldKeepBundledForFederation } from './externals-bypass';
import { FEDERATION_PLUGIN_NAME, federation } from './index';
import type { ModuleFederationOptions } from './types';

const require = createRequire(import.meta.url);
const NODE_RUNTIME_PLUGIN_REQUEST = '@module-federation/node/runtimePlugin';
const NODE_RUNTIME_PLUGIN = require.resolve(NODE_RUNTIME_PLUGIN_REQUEST);

type FederationPlugin = ReturnType<typeof federation>;

type TestRstestConfig = {
  browser?: {
    enabled?: boolean;
  };
  federation?: boolean;
};

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

type BeforeCreateCompilerHook = (args: {
  bundlerConfigs?: Rspack.Configuration[];
}) => void;

type BeforeCreateCompilerHookDescriptor =
  | BeforeCreateCompilerHook
  | {
      handler: BeforeCreateCompilerHook;
      order?: 'pre' | 'post' | 'default';
    };

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

// Test-only view of the options captured by ModuleFederationPlugin. Production
// code does not inspect this private field.
type ModuleFederationPluginInstance = {
  name?: string;
  _options?: ModuleFederationOptions;
};

const shallowMergeEnvironmentConfig: MergeEnvironmentConfig = (...configs) =>
  Object.assign({}, ...configs);

const getFederationPluginOptions = (
  plugins: unknown[] | undefined,
): ModuleFederationOptions => {
  const plugin = (plugins ?? []).find(
    (item): item is ModuleFederationPluginInstance =>
      (item as ModuleFederationPluginInstance | undefined)?.name ===
      PLUGIN_NAME,
  );
  expect(plugin).toBeTruthy();
  const options = plugin!._options;
  expect(options).toBeTruthy();
  return options!;
};

const createRsbuildFederationExposeAPI = (
  initialOptions: ModuleFederationOptions,
): RsbuildFederationExposeAPI => {
  let options = initialOptions;

  return {
    options: {},
    assetResources: {},
    getOptions: () => options,
    registerOptionsTransformer: (transformer) => {
      options = transformer(options);
    },
    isSSRConfig: () => false,
    isRspressSSGConfig: () => false,
  };
};

// Minimal Rsbuild API surface used by the plugin.
const setupFederationPlugin = (
  plugin: FederationPlugin,
  callerName = 'rstest',
  rstestConfig: TestRstestConfig = {},
  exposedApis: {
    rsbuildFederation?: RsbuildFederationExposeAPI;
    rstest?: boolean;
  } = {},
): {
  beforeCreateCompilerHook: BeforeCreateCompilerHook | undefined;
  beforeCreateCompilerOrder: unknown;
  envHook: EnvHook;
  order: unknown;
  rstestConfig: TestRstestConfig;
} => {
  let beforeCreateCompilerHook: BeforeCreateCompilerHook | undefined;
  let beforeCreateCompilerOrder: unknown;
  let envHook: EnvHook | undefined;
  let order: unknown;

  const fakeApi = {
    context: { callerName },
    useExposed: (name: string) => {
      if (name === 'rstest' && exposedApis.rstest !== false) {
        return {
          getRstestConfig: () => rstestConfig,
          modifyRstestConfig: (callback: (config: TestRstestConfig) => void) =>
            callback(rstestConfig),
        };
      }

      if (name === RSBUILD_PLUGIN_MODULE_FEDERATION_NAME) {
        return exposedApis.rsbuildFederation;
      }

      return undefined;
    },
    modifyEnvironmentConfig: (hook: EnvHookDescriptor) => {
      if (typeof hook === 'function') {
        envHook = hook;
      } else {
        envHook = hook.handler;
        order = hook.order;
      }
    },
    onBeforeCreateCompiler: (hook: BeforeCreateCompilerHookDescriptor) => {
      if (typeof hook === 'function') {
        beforeCreateCompilerHook = hook;
      } else {
        beforeCreateCompilerHook = hook.handler;
        beforeCreateCompilerOrder = hook.order;
      }
    },
  };

  plugin.setup(fakeApi as unknown as RsbuildPluginAPI);

  expect(typeof envHook).toBe('function');
  return {
    beforeCreateCompilerHook,
    beforeCreateCompilerOrder,
    envHook: envHook!,
    order,
    rstestConfig,
  };
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
    rsbuildFederation,
    rstestConfig = {},
  }: {
    callerName?: string;
    config?: EnvironmentConfig;
    mergeEnvironmentConfig?: MergeEnvironmentConfig;
    rspackConfig?: TestRspackConfig;
    rsbuildFederation?: RsbuildFederationExposeAPI;
    rstestConfig?: TestRstestConfig;
  } = {},
) => {
  const { envHook } = setupFederationPlugin(plugin, callerName, rstestConfig, {
    rsbuildFederation,
  });
  const merged = envHook(config, { mergeEnvironmentConfig });

  runRspackHooks(merged, rspackConfig);

  return { merged, rspackConfig };
};

const captureWarnings = <T>(
  run: () => T,
): { result: T; warnings: string[] } => {
  const warningSpy = rs
    .spyOn(console, 'warn')
    .mockImplementation(() => undefined);

  try {
    return {
      result: run(),
      warnings: warningSpy.mock.calls.map((args) =>
        args.map((arg) => String(arg)).join(' '),
      ),
    };
  } finally {
    warningSpy.mockRestore();
  }
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
    const rsbuildFederation = createRsbuildFederationExposeAPI({
      name: 'host',
    });
    const { order } = setupFederationPlugin(
      federation(),
      'rstest',
      {},
      {
        rsbuildFederation,
      },
    );
    expect(order).toBe('post');
  });

  it('does not register a late compiler mutation hook', () => {
    const rsbuildFederation = createRsbuildFederationExposeAPI({
      name: 'host',
    });
    const { beforeCreateCompilerHook } = setupFederationPlugin(
      federation(),
      'rstest',
      {},
      { rsbuildFederation },
    );
    expect(beforeCreateCompilerHook).toBeUndefined();
  });

  it('enables Rstest federation compatibility for node targets', () => {
    const rsbuildFederation = createRsbuildFederationExposeAPI({
      name: 'host',
    });
    const { rstestConfig } = setupFederationPlugin(
      federation(),
      'rstest',
      {},
      { rsbuildFederation },
    );

    expect(rstestConfig.federation).toBe(true);
  });

  it('fails clearly when the required Rstest exposed API is unavailable', () => {
    expect(() =>
      setupFederationPlugin(
        federation({ name: 'missing_rstest_api' }),
        'rstest',
        {},
        {
          rstest: false,
        },
      ),
    ).toThrow(
      '@module-federation/rstest requires @rstest/core 0.11.4 or newer',
    );
  });

  it('allows an explicit browser target without the Node compatibility API', () => {
    expect(() =>
      setupFederationPlugin(
        federation(
          { name: 'browser_without_rstest_api' },
          { target: 'browser' },
        ),
        'rstest',
        {},
        { rstest: false },
      ),
    ).not.toThrow();
  });

  it('rejects duplicate direct and Rsbuild-owned federation configuration', () => {
    const rsbuildFederation = createRsbuildFederationExposeAPI({
      name: 'rsbuild_owned_host',
    });

    expect(() =>
      setupFederationPlugin(
        federation({ name: 'direct_host' }),
        'rstest',
        {},
        { rsbuildFederation },
      ),
    ).toThrow('Federation is configured by both');
  });

  it('normalizes Rsbuild-owned options through the exposed integration API', () => {
    const rsbuildFederation = createRsbuildFederationExposeAPI({
      name: 'rsbuild_owned_host',
      remotes: {
        component: 'component@http://localhost:3001/remoteEntry.js',
      },
    });

    setupFederationPlugin(federation(), 'rstest', {}, { rsbuildFederation });

    expect(rsbuildFederation.getOptions()).toMatchObject({
      name: 'rsbuild_owned_host',
      remoteType: 'script',
      library: {
        name: 'rsbuild_owned_host',
        type: 'commonjs-module',
      },
      experiments: {
        asyncStartup: true,
        optimization: {
          target: 'node',
        },
      },
    });
  });

  it('creates one compiler plugin from Rsbuild-owned options', () => {
    const rsbuildFederation = createRsbuildFederationExposeAPI({
      name: 'rsbuild_owned_host',
    });

    const { rspackConfig } = applyFederationPlugin(federation(), {
      rsbuildFederation,
    });

    expect(
      rspackConfig.plugins?.filter(
        (plugin) =>
          (plugin as ModuleFederationPluginInstance | undefined)?.name ===
          PLUGIN_NAME,
      ),
    ).toHaveLength(1);
    expect(getFederationPluginOptions(rspackConfig.plugins).name).toBe(
      'rsbuild_owned_host',
    );
  });

  it('does not enable Rstest federation compatibility in Browser Mode', () => {
    const rsbuildFederation = createRsbuildFederationExposeAPI({
      name: 'host',
    });
    const { rstestConfig } = setupFederationPlugin(
      federation(),
      'rstest',
      {
        browser: { enabled: true },
      },
      { rsbuildFederation },
    );

    expect(rstestConfig.federation).toBeUndefined();
  });

  it('patches rspack config to force CJS output in node/jsdom workers', () => {
    const { merged, rspackConfig } = applyFederationPlugin(federation(), {
      rsbuildFederation: createRsbuildFederationExposeAPI({ name: 'host' }),
    });

    expect(merged.output?.target).toBe('node');
    expect(rspackConfig.target).toBe('async-node');
    expect(rspackConfig.optimization?.splitChunks).toBe(false);
    expect(rspackConfig.experiments?.outputModule).toBe(false);
    expect(rspackConfig.output?.module).toBe(false);
  });

  it('keeps federation remote requests bundled via externals bypass', () => {
    const rsbuildFederation = createRsbuildFederationExposeAPI({
      name: 'existing_host',
      remotes: {
        'component-app': 'component_app@http://localhost:3001/remoteEntry.js',
      },
    });
    const { rspackConfig } = applyFederationPlugin(federation(), {
      rsbuildFederation,
      rspackConfig: {
        output: {},
        externals: ['react'],
        plugins: [],
      },
    });

    const bypass = getExternalBypass(rspackConfig);
    expect(callExternal(bypass, 'component-app/Button')).toBe(false);
    expect(callExternal(bypass, 'react')).toBe(undefined);
  });

  it('rejects an existing compiler plugin when direct options are used', () => {
    expect(() =>
      applyFederationPlugin(
        federation({
          name: 'direct_host',
          remotes: {
            directRemote: 'directRemote@http://localhost:3001/remoteEntry.js',
          },
        }),
        {
          rspackConfig: {
            output: {},
            plugins: [
              new ModuleFederationPlugin({
                name: 'existing_host',
                remotes: {
                  existingRemote:
                    'existingRemote@http://localhost:3002/remoteEntry.js',
                },
              }),
            ],
          },
        },
      ),
    ).toThrow('Federation is configured by both');
  });

  it('reads normalized remotes from the Rsbuild-owned integration API', () => {
    const originalOptions: ModuleFederationOptions = {
      name: 'existing_host',
      remotes: {
        'component-app': 'component_app@http://localhost:3001/remoteEntry.js',
      },
    };
    const rsbuildFederation = createRsbuildFederationExposeAPI(originalOptions);
    const { rspackConfig } = applyFederationPlugin(federation(), {
      rsbuildFederation,
      rspackConfig: {
        output: {},
        externals: ['react'],
        plugins: [],
      },
    });

    expect(originalOptions.remoteType).toBeUndefined();

    const bypass = getExternalBypass(rspackConfig);
    expect(callExternal(bypass, 'component-app/Button')).toBe(false);
    expect(callExternal(bypass, 'react')).toBe(undefined);

    const options = rsbuildFederation.getOptions();
    expect(options.remoteType).toBe('script');
    expect(options.library).toEqual({
      name: 'existing_host',
      type: 'commonjs-module',
    });
    expect(options.runtimePlugins).toEqual([NODE_RUNTIME_PLUGIN]);
    expect(options.experiments?.asyncStartup).toBe(true);
    expect(options.experiments?.optimization?.target).toBe('node');
  });

  it('applies browser defaults through the Rsbuild-owned integration API', () => {
    const rsbuildFederation = createRsbuildFederationExposeAPI({
      name: 'existing_browser_host',
    });
    applyFederationPlugin(federation(), {
      rsbuildFederation,
      rstestConfig: {
        browser: { enabled: true },
      },
    });

    const options = rsbuildFederation.getOptions();
    expect(options.dts).toBe(false);
    expect(options.manifest).toBe(false);
    expect(options.dev).toBe(false);
    expect(options.experiments?.asyncStartup).toBe(true);
    expect(options.remoteType).toBeUndefined();
    expect(options.library).toBeUndefined();
    expect(options.runtimePlugins).toBeUndefined();
  });

  it('does not register late normalization for direct options', () => {
    const { beforeCreateCompilerHook } = setupFederationPlugin(
      federation({ name: 'direct_host' }),
    );

    expect(beforeCreateCompilerHook).toBeUndefined();
  });

  it('does not treat an existing runtime plugin as manual configuration', () => {
    const { warnings } = captureWarnings(() => {
      const rsbuildFederation = createRsbuildFederationExposeAPI({
        name: 'existing_node_host',
        runtimePlugins: [NODE_RUNTIME_PLUGIN],
      });
      applyFederationPlugin(federation(), {
        rsbuildFederation,
      });
    });

    expect(warnings.join('\n')).not.toContain(
      'manual configuration is unnecessary',
    );
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
    expect(options.name).toBe('main_app_web');
    expect(options.library?.type).toBe('commonjs-module');
    expect(options.library?.name).toBe('main_app_web');
    expect(options.remoteType).toBe('script');
    expect(options.runtimePlugins).toEqual([NODE_RUNTIME_PLUGIN]);
    expect(options.experiments?.asyncStartup).toBe(true);
    expect(options.experiments?.optimization?.target).toBe('node');
  });

  it('disables dts, manifest, and dev machinery by default', () => {
    const { rspackConfig } = applyFederationPlugin(
      federation({ name: 'defaults_off_app' }),
    );

    const options = getFederationPluginOptions(rspackConfig.plugins);
    expect(options.dts).toBe(false);
    expect(options.manifest).toBe(false);
    expect(options.dev).toBe(false);
  });

  it('disables dts, manifest, and dev by default for browser target too', () => {
    const { rspackConfig } = applyFederationPlugin(
      federation({ name: 'browser_defaults_off_app' }, { target: 'browser' }),
    );

    const options = getFederationPluginOptions(rspackConfig.plugins);
    expect(options.dts).toBe(false);
    expect(options.manifest).toBe(false);
    expect(options.dev).toBe(false);
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
    expect(options.dts).toBe(true);
    expect(options.manifest).toEqual({ filePath: 'custom' });
    expect(options.dev).toBe(true);
  });

  it('preserves user overrides while still injecting node runtime plugin', () => {
    const { result: options, warnings } = captureWarnings(() => {
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
      return getFederationPluginOptions(rspackConfig.plugins);
    });

    expect(options.remoteType).toBe('commonjs');
    expect(options.library?.type).toBe('var');
    expect(options.library?.name).toBe('component_app');
    expect(options.experiments?.asyncStartup).toBe(true);
    expect(options.runtimePlugins).toEqual([
      NODE_RUNTIME_PLUGIN,
      'custom/runtimePlugin',
    ]);
    expect(warnings.join('\n')).toContain(
      'library.name "custom_library_name" is overridden with the container name "component_app"',
    );
  });

  it('forces node optimization target even when configured otherwise', () => {
    const { result: options, warnings } = captureWarnings(() => {
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
      return getFederationPluginOptions(rspackConfig.plugins);
    });

    expect(options.experiments?.optimization?.target).toBe('node');
    expect(warnings.join('\n')).toContain(
      'experiments.optimization.target "web" is overridden with "node"',
    );
  });

  it.each(['module', 'modern-module'] as const)(
    'normalizes incompatible %s library output',
    (libraryType) => {
      const { result: options, warnings } = captureWarnings(() => {
        const { rspackConfig } = applyFederationPlugin(
          federation({
            name: 'component_app',
            library: {
              type: libraryType,
            },
          }),
        );
        return getFederationPluginOptions(rspackConfig.plugins);
      });

      expect(options.library).toEqual({
        name: 'component_app',
        type: 'commonjs-module',
      });
      expect(warnings.join('\n')).toContain(
        `library.type "${libraryType}" is overridden with "commonjs-module"`,
      );
    },
  );

  it('forces async startup and warns when disabled manually', () => {
    const { result: options, warnings } = captureWarnings(() => {
      const { rspackConfig } = applyFederationPlugin(
        federation({
          name: 'legacy_component_app',
          experiments: {
            asyncStartup: false,
          },
        }),
      );
      return getFederationPluginOptions(rspackConfig.plugins);
    });

    expect(options.experiments?.asyncStartup).toBe(true);
    expect(warnings.join('\n')).toContain(
      'experiments.asyncStartup was set to false but is forced to true',
    );
  });

  it('warns when the node runtime plugin is configured manually', () => {
    const { result: options, warnings } = captureWarnings(() => {
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
      return getFederationPluginOptions(rspackConfig.plugins);
    });

    expect(options.runtimePlugins).toEqual([NODE_RUNTIME_PLUGIN]);
    expect(warnings.join('\n')).toContain(
      'manual configuration is unnecessary',
    );
  });

  it('deduplicates configured node runtime plugin aliases', () => {
    const runtimePluginOptions = { enabled: true };
    const { rspackConfig } = applyFederationPlugin(
      federation({
        name: 'legacy_component_app',
        runtimePlugins: [
          [NODE_RUNTIME_PLUGIN_REQUEST, runtimePluginOptions],
          NODE_RUNTIME_PLUGIN,
          'custom/runtimePlugin',
        ],
      }),
    );

    const options = getFederationPluginOptions(rspackConfig.plugins);
    expect(options.runtimePlugins).toEqual([
      [NODE_RUNTIME_PLUGIN, runtimePluginOptions],
      'custom/runtimePlugin',
    ]);
  });

  it('warns when running outside rstest', () => {
    const { warnings } = captureWarnings(() => {
      const rsbuildFederation = createRsbuildFederationExposeAPI({
        name: 'host',
      });
      setupFederationPlugin(
        federation(),
        'rsbuild',
        {},
        {
          rsbuildFederation,
        },
      );
    });

    expect(warnings.join('\n')).toContain(
      'designed to run under rstest, but the current caller is "rsbuild"',
    );
  });

  it('does not warn about the caller under rstest', () => {
    const { warnings } = captureWarnings(() => {
      const rsbuildFederation = createRsbuildFederationExposeAPI({
        name: 'host',
      });
      setupFederationPlugin(
        federation(),
        'rstest',
        {},
        {
          rsbuildFederation,
        },
      );
    });

    expect(warnings.join('\n')).not.toContain('designed to run under rstest');
  });

  it('defaults to browser target when Browser Mode is enabled', () => {
    const { merged, rspackConfig } = applyFederationPlugin(
      federation({ name: 'browser_caller_app' }),
      { rstestConfig: { browser: { enabled: true } } },
    );

    expect(merged.output?.target).not.toBe('node');
    expect(rspackConfig.target).toBe(undefined);
    expect(rspackConfig.output?.module).toBe(undefined);

    const options = getFederationPluginOptions(rspackConfig.plugins);
    expect(options.library).toBe(undefined);
    expect(options.runtimePlugins).toBe(undefined);
  });

  it('lets an explicit node target win over detected Browser Mode', () => {
    const { merged, rspackConfig } = applyFederationPlugin(
      federation({ name: 'forced_node_app' }, { target: 'node' }),
      { rstestConfig: { browser: { enabled: true } } },
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
    expect(options.remoteType).toBe(undefined);
    expect(options.library).toBe(undefined);
    expect(options.runtimePlugins).toBe(undefined);
    expect(options.experiments?.asyncStartup).toBe(true);
  });

  it('defaults node remote transport to script', () => {
    const { rspackConfig } = applyFederationPlugin(
      federation({
        name: 'prefixed_commonjs_remote',
        remotes: {
          host: 'commonjs /tmp/remoteEntry.js',
        },
      }),
    );

    const options = getFederationPluginOptions(rspackConfig.plugins);
    expect(options.remoteType).toBe('script');
  });

  it('sets the node remote transport default without configured remotes', () => {
    const { rspackConfig } = applyFederationPlugin(
      federation({
        name: 'no_remotes',
        shared: {
          react: { singleton: true },
        },
      }),
    );

    const options = getFederationPluginOptions(rspackConfig.plugins);
    expect(options.remoteType).toBe('script');
  });

  it('collects remote names from string remotes (mf-manifest) and bypasses externals', () => {
    const rsbuildFederation = createRsbuildFederationExposeAPI({
      name: 'manifest_host',
      remotes: ['component-app@http://localhost:3001/mf-manifest.json'],
    });
    const { rspackConfig } = applyFederationPlugin(federation(), {
      rsbuildFederation,
      rspackConfig: {
        output: {},
        externals: [],
        plugins: [],
      },
    });

    const bypass = getExternalBypass(rspackConfig);
    expect(callExternal(bypass, 'component-app/Button')).toBe(false);
  });

  it('composes with existing tools.rspack hook instead of overwriting it', () => {
    const existingHook = (cfg: Rspack.Configuration) => {
      (
        cfg as TestRspackConfig & { __existingHookRan?: boolean }
      ).__existingHookRan = true;
    };

    const rspackConfig: TestRspackConfig & { __existingHookRan?: boolean } = {
      output: {},
      plugins: [],
    };
    const { merged } = applyFederationPlugin(federation(), {
      config: { tools: { rspack: existingHook } },
      mergeEnvironmentConfig: mergeRsbuildConfig,
      rsbuildFederation: createRsbuildFederationExposeAPI({ name: 'host' }),
      rspackConfig,
    });

    expect(Array.isArray(merged.tools?.rspack)).toBe(true);
    expect(rspackConfig.__existingHookRan).toBe(true);
    expect(rspackConfig.experiments?.outputModule).toBe(false);
    expect(rspackConfig.output?.module).toBe(false);
  });
});
