import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import AsyncEntryStartupPlugin from '../../../src/lib/container/AsyncBoundaryPlugin';
import type { Compiler } from 'webpack';

const webpack = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const startup = (options: Compiler['options']) => {
  const compiler = { webpack, options } as Compiler;
  const source = new webpack.sources.RawSource('__webpack_require__(1);');
  return new AsyncEntryStartupPlugin()['_getTemplateString'](
    compiler,
    [],
    '',
    '',
    source,
  );
};

describe('AsyncEntryStartupPlugin startup with top-level await', () => {
  it('awaits federation init for ESM output enabled by output.module', () => {
    const code = startup({
      experiments: { topLevelAwait: true },
      output: { module: true },
    } as Compiler['options']);
    expect(code).toContain('await Promise.all(promiseTrack)');
  });

  it('wraps startup in a promise for non-ESM output', () => {
    const code = startup({
      experiments: { topLevelAwait: true },
      output: { module: false },
    } as Compiler['options']);
    expect(code).not.toContain('await Promise.all');
    expect(code).toContain('Promise.all(promiseTrack).then(');
  });

  // The shapes webpack normalizes its options to: an output capability from
  // 5.111, an experiment before 5.102, and neither setting in between.
  it.each([
    ['the output capability', { environment: { topLevelAwait: true } }, {}],
    ['neither setting', {}, {}],
    ['the experiment', {}, { topLevelAwait: true }],
  ])('awaits federation init with %s', (_name, output, experiments) => {
    const code = startup({
      experiments,
      output: { module: true, ...output },
    } as Compiler['options']);
    expect(code).toContain('await Promise.all(promiseTrack)');
  });

  it.each([
    [
      'the output capability off',
      { environment: { topLevelAwait: false } },
      { topLevelAwait: true },
    ],
    ['the experiment off', {}, { topLevelAwait: false }],
  ])('wraps startup in a promise with %s', (_name, output, experiments) => {
    const code = startup({
      experiments,
      output: { module: true, ...output },
    } as Compiler['options']);
    expect(code).not.toContain('await Promise.all');
    expect(code).toContain('Promise.all(promiseTrack).then(');
  });
});
