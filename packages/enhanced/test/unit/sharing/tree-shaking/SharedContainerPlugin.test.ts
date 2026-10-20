/*
 * @rstest-environment node
 */

import { rs } from '@rstest/core';
import { AsyncSeriesHook, SyncHook } from 'tapable';
import type { Compiler } from 'webpack';
import SharedContainerPlugin from '../../../../src/lib/sharing/tree-shaking/SharedContainerPlugin/SharedContainerPlugin';

type EntryCallback = (error?: Error | null) => void;

const setup = () => {
  const compiler = {
    options: { output: { enabledLibraryTypes: [] as string[] } },
    hooks: {
      make: new AsyncSeriesHook<[unknown]>(['compilation']),
      thisCompilation: new SyncHook<[unknown, unknown]>([
        'compilation',
        'params',
      ]),
    },
  };
  new SharedContainerPlugin({
    mfName: 'host',
    shareName: 'ui-lib',
    version: '1.0.0',
    request: 'ui-lib',
  }).apply(compiler as unknown as Compiler);

  let finishEntry: EntryCallback = () => {
    throw new Error('addEntry was not called');
  };
  const compilation = {
    options: { context: '/ctx' },
    addEntry: rs.fn(
      (
        _context: string,
        _dep: unknown,
        _options: unknown,
        callback: EntryCallback,
      ) => {
        finishEntry = callback;
      },
    ),
  };
  const makeDone = rs.fn();
  compiler.hooks.make.callAsync(compilation, makeDone);
  expect(compilation.addEntry).toHaveBeenCalledTimes(1);

  return { makeDone, finishEntry: (error?: Error) => finishEntry(error) };
};

describe('SharedContainerPlugin make', () => {
  it('finishes make only after addEntry completes', () => {
    const { makeDone, finishEntry } = setup();

    expect(makeDone).not.toHaveBeenCalled();

    finishEntry();
    expect(makeDone).toHaveBeenCalledTimes(1);
    expect(makeDone).toHaveBeenCalledWith();
  });

  it('reports an addEntry error through the make callback', () => {
    const { makeDone, finishEntry } = setup();
    const error = new Error('entry failed');

    expect(() => finishEntry(error)).not.toThrow();
    expect(makeDone).toHaveBeenCalledTimes(1);
    expect(makeDone).toHaveBeenCalledWith(error);
  });
});
