import { describe, expect, it } from 'vitest';

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

  it('does not keep unrelated packages bundled', () => {
    expect(shouldKeepBundledForFederation('react')).toBe(false);
  });
});

describe('federation()', () => {
  it('patches rspack config to force CJS output in node/jestdom workers', () => {
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
});
