import { describe, expect, it } from '@rstest/core';

import { federation, shouldKeepBundledForFederation } from './index';

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
