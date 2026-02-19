import { describe, expect, it } from '@rstest/core';

import { federation, shouldKeepBundledForFederation } from './index';

const getFederationPluginOptions = (plugins: unknown[]) => {
  const plugin = (plugins as any[]).find(
    (item) => item?.constructor?.name === 'ModuleFederationPlugin',
  );
  expect(plugin).toBeTruthy();
  return (plugin as any)._options ?? (plugin as any).options;
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
  it('patches rspack config to force CJS output in node/jsdom workers', () => {
    const plugin = federation();
    expect(plugin.name).toBe('rstest:federation');

    let envCb:
      | ((
          config: any,
          utils: { mergeEnvironmentConfig: (...configs: any[]) => any },
        ) => any)
      | undefined;

    plugin.setup({
      // Minimal API surface we use in the plugin.
      modifyEnvironmentConfig: (cb: any) => {
        envCb = cb;
      },
    } as any);

    expect(typeof envCb).toBe('function');

    const mergeEnvironmentConfig = (...configs: any[]) => {
      // Shallow merge that is enough for the assertions in this test.
      return Object.assign({}, ...configs);
    };

    const merged = envCb!({} as any, { mergeEnvironmentConfig });
    expect(merged.output?.target).toBe('node');
    expect(typeof merged.tools?.rspack).toBe('function');

    const rspackConfig: any = {
      plugins: [],
      output: {},
    };
    merged.tools.rspack(rspackConfig);

    expect(rspackConfig.target).toBe('async-node');
    expect(rspackConfig.optimization?.splitChunks).toBe(false);
    expect(rspackConfig.experiments?.outputModule).toBe(false);
    expect(rspackConfig.output?.module).toBe(false);
  });

  it('keeps federation remote requests bundled via externals bypass', () => {
    const plugin = federation();

    let envCb:
      | ((
          config: any,
          utils: { mergeEnvironmentConfig: (...configs: any[]) => any },
        ) => any)
      | undefined;

    plugin.setup({
      modifyEnvironmentConfig: (cb: any) => {
        envCb = cb;
      },
    } as any);

    const mergeEnvironmentConfig = (...configs: any[]) =>
      Object.assign({}, ...configs);

    const merged = envCb!({} as any, { mergeEnvironmentConfig });
    const rspackConfig: any = {
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
    };

    merged.tools.rspack(rspackConfig);
    expect(Array.isArray(rspackConfig.externals)).toBe(true);
    expect(typeof rspackConfig.externals[0]).toBe('function');

    let keptResult: any = 'unset';
    rspackConfig.externals[0](
      { request: 'component-app/Button' },
      (_err: unknown, result?: unknown) => {
        keptResult = result;
      },
    );
    expect(keptResult).toBe(false);

    let passThroughResult: any = 'unset';
    rspackConfig.externals[0](
      { request: 'react' },
      (_err: unknown, result?: unknown) => {
        passThroughResult = result;
      },
    );
    expect(passThroughResult).toBe(undefined);
  });

  it('auto-applies ModuleFederationPlugin with node defaults', () => {
    const plugin = federation({
      name: 'main_app_web',
      remotes: {
        'component-app': 'component_app@http://localhost:3001/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
      },
    });

    let envCb:
      | ((
          config: any,
          utils: { mergeEnvironmentConfig: (...configs: any[]) => any },
        ) => any)
      | undefined;

    plugin.setup({
      modifyEnvironmentConfig: (cb: any) => {
        envCb = cb;
      },
    } as any);

    const mergeEnvironmentConfig = (...configs: any[]) =>
      Object.assign({}, ...configs);

    const merged = envCb!({} as any, { mergeEnvironmentConfig });
    const rspackConfig: any = {
      output: {},
      plugins: [],
    };
    merged.tools.rspack(rspackConfig);

    expect(rspackConfig.target).toBe('async-node');
    expect(rspackConfig.optimization?.splitChunks).toBe(false);
    expect(rspackConfig.experiments?.outputModule).toBe(false);
    expect(rspackConfig.output?.module).toBe(false);

    const options = getFederationPluginOptions(rspackConfig.plugins);
    expect(options.name).toBe('main_app_web');
    expect(options.library?.type).toBe('commonjs-module');
    expect(options.library?.name).toBe('main_app_web');
    expect(options.remoteType).toBe('script');
    expect(options.runtimePlugins).toContain(
      '@module-federation/node/runtimePlugin',
    );
    expect(options.experiments?.optimization?.target).toBe('node');
  });

  it('preserves user overrides while still injecting node runtime plugin', () => {
    const plugin = federation({
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
    });

    let envCb:
      | ((
          config: any,
          utils: { mergeEnvironmentConfig: (...configs: any[]) => any },
        ) => any)
      | undefined;

    plugin.setup({
      modifyEnvironmentConfig: (cb: any) => {
        envCb = cb;
      },
    } as any);

    const mergeEnvironmentConfig = (...configs: any[]) =>
      Object.assign({}, ...configs);

    const merged = envCb!({} as any, { mergeEnvironmentConfig });
    const rspackConfig: any = {
      output: {},
      plugins: [],
    };
    merged.tools.rspack(rspackConfig);

    const options = getFederationPluginOptions(rspackConfig.plugins);
    expect(options.remoteType).toBe('commonjs');
    expect(options.library?.type).toBe('var');
    expect(options.library?.name).toBe('component_app');
    expect(options.runtimePlugins[0]).toBe(
      '@module-federation/node/runtimePlugin',
    );
    expect(options.runtimePlugins).toContain('custom/runtimePlugin');
  });

  it('supports browser target without node-specific rspack patches', () => {
    const plugin = federation(
      {
        name: 'browser_app',
        remotes: {
          provider: 'provider@http://localhost:4001/remoteEntry.js',
        },
      },
      {
        target: 'browser',
      },
    );

    let envCb:
      | ((
          config: any,
          utils: { mergeEnvironmentConfig: (...configs: any[]) => any },
        ) => any)
      | undefined;

    plugin.setup({
      modifyEnvironmentConfig: (cb: any) => {
        envCb = cb;
      },
    } as any);

    const mergeEnvironmentConfig = (...configs: any[]) =>
      Object.assign({}, ...configs);

    const merged = envCb!({} as any, { mergeEnvironmentConfig });
    expect(merged.output?.target).not.toBe('node');

    const rspackConfig: any = {
      output: {},
      plugins: [],
    };
    merged.tools.rspack(rspackConfig);

    expect(rspackConfig.target).toBe(undefined);
    expect(rspackConfig.optimization?.splitChunks).toBe(undefined);
    expect(rspackConfig.experiments?.outputModule).toBe(undefined);
    expect(rspackConfig.output?.module).toBe(undefined);

    const options = getFederationPluginOptions(rspackConfig.plugins);
    expect(options.remoteType).toBe(undefined);
    expect(options.library).toBe(undefined);
    expect(options.runtimePlugins).toBe(undefined);
  });

  it('does not force remoteType when no remotes are configured', () => {
    const plugin = federation({
      name: 'no_remotes',
      shared: {
        react: { singleton: true },
      },
    });

    let envCb:
      | ((
          config: any,
          utils: { mergeEnvironmentConfig: (...configs: any[]) => any },
        ) => any)
      | undefined;

    plugin.setup({
      modifyEnvironmentConfig: (cb: any) => {
        envCb = cb;
      },
    } as any);

    const mergeEnvironmentConfig = (...configs: any[]) =>
      Object.assign({}, ...configs);

    const merged = envCb!({} as any, { mergeEnvironmentConfig });
    const rspackConfig: any = {
      output: {},
      plugins: [],
    };
    merged.tools.rspack(rspackConfig);

    const options = getFederationPluginOptions(rspackConfig.plugins);
    expect(options.remoteType).toBe(undefined);
  });

  it('collects remote names from string remotes (mf-manifest) and bypasses externals', () => {
    const plugin = federation();

    let envCb:
      | ((
          config: any,
          utils: { mergeEnvironmentConfig: (...configs: any[]) => any },
        ) => any)
      | undefined;

    plugin.setup({
      modifyEnvironmentConfig: (cb: any) => {
        envCb = cb;
      },
    } as any);

    const mergeEnvironmentConfig = (...configs: any[]) =>
      Object.assign({}, ...configs);

    const merged = envCb!({} as any, { mergeEnvironmentConfig });
    const rspackConfig: any = {
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
    };

    merged.tools.rspack(rspackConfig);

    let keptResult: any = 'unset';
    rspackConfig.externals[0](
      { request: 'component-app/Button' },
      (_err: unknown, result?: unknown) => {
        keptResult = result;
      },
    );
    expect(keptResult).toBe(false);
  });

  it('composes with existing tools.rspack hook instead of overwriting it', () => {
    const plugin = federation();

    let envCb:
      | ((
          config: any,
          utils: { mergeEnvironmentConfig: (...configs: any[]) => any },
        ) => any)
      | undefined;

    plugin.setup({
      modifyEnvironmentConfig: (cb: any) => {
        envCb = cb;
      },
    } as any);

    const mergeEnvironmentConfig = (...configs: any[]) => {
      // Basic merge that preserves nested objects we care about for this test.
      const out: any = {};
      for (const c of configs) {
        if (!c) continue;
        if (c.output) out.output = { ...(out.output || {}), ...c.output };
        if (c.tools) out.tools = { ...(out.tools || {}), ...c.tools };
      }
      return out;
    };

    const existingHook = (cfg: any) => {
      cfg.__existingHookRan = true;
    };

    const merged = envCb!({ tools: { rspack: existingHook } } as any, {
      mergeEnvironmentConfig,
    });

    expect(Array.isArray(merged.tools?.rspack)).toBe(true);

    const rspackConfig: any = { output: {}, plugins: [] };
    for (const hook of merged.tools.rspack) {
      if (typeof hook === 'function') hook(rspackConfig, {} as any);
    }

    expect(rspackConfig.__existingHookRan).toBe(true);
    expect(rspackConfig.experiments?.outputModule).toBe(false);
    expect(rspackConfig.output?.module).toBe(false);
  });
});
