import type { Compiler, RuleSetRule } from 'webpack';
import { applyPathFixes, retrieveDefaultShared } from './next-fragments';

describe('applyPathFixes', () => {
  it('does not create empty loader dependencies for runtimePlugin rules', () => {
    const compiler = {
      context: '/workspace',
      options: {
        module: {
          rules: [
            {
              test: /thing\.js$/,
              use: 'react-refresh-loader',
            },
          ],
        },
      },
    } as unknown as Compiler;

    applyPathFixes(compiler, {} as never, {
      enableImageLoaderFix: false,
      enableUrlLoaderFix: false,
    });

    const firstRule = compiler.options.module.rules[0] as RuleSetRule & {
      oneOf?: RuleSetRule[];
    };

    expect(firstRule.oneOf).toBeDefined();
    expect(firstRule.oneOf?.[0].use).toBeUndefined();
    expect(firstRule.oneOf?.[1].use).toBeUndefined();
  });
});

describe('retrieveDefaultShared', () => {
  it('uses browser-style shared config for app directory builds', () => {
    const shared = retrieveDefaultShared(true, true);
    const reactShared = shared['react'] as
      | undefined
      | {
          import?: boolean;
        };

    expect(reactShared).toBeDefined();
    expect(reactShared?.import).toBeUndefined();
  });
});
