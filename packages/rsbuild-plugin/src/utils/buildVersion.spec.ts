import { expect, it, rs } from '@rstest/core';
import { setCompilationBuildVersion } from '@module-federation/enhanced/rspack';
import { createSharedBuildVersionPlugin } from './buildVersion';
import * as original from '@module-federation/enhanced/rspack' with {
  rstest: 'importActual',
};

rs.mock('@module-federation/enhanced/rspack', () => ({
  ...original,
  setCompilationBuildVersion: rs.fn(original.setCompilationBuildVersion),
}));

function hook() {
  const handlers: { stage: number; callback: (...args: any[]) => void }[] = [];
  return {
    tap(options: { stage?: number }, callback: (...args: any[]) => void) {
      handlers.push({ stage: options.stage || 0, callback });
    },
    call(...args: any[]) {
      for (const handler of [...handlers].sort((a, b) => a.stage - b.stage))
        handler.callback(...args);
    },
  };
}

it('aligns dual outputs and rebuilds the peer after edits in either target', () => {
  const plugin = createSharedBuildVersionPlugin();
  const compilers = ['browser', 'node'].map(() => {
    const hooks = { thisCompilation: hook(), invalid: hook() };
    const compiler = {
      options: { mode: 'development' },
      hooks,
      watching: { invalidate: rs.fn(() => hooks.invalid.call()) },
    };
    plugin.apply(compiler as any);
    return compiler;
  });
  const compile = () =>
    compilers.map((compiler) => {
      const compilation = {};
      compiler.hooks.thisCompilation.call(compilation);
      return rs
        .mocked(setCompilationBuildVersion)
        .mock.calls.find(([value]) => value === compilation)![1];
    });
  const initial = compile();
  expect(initial[0]).toBe(initial[1]);
  compilers[0].hooks.invalid.call();
  expect(compilers[1].watching.invalidate).toHaveBeenCalledTimes(1);
  expect(compilers[0].watching.invalidate).not.toHaveBeenCalled();
  const browserEdit = compile();
  expect(browserEdit[0]).toBe(browserEdit[1]);
  expect(browserEdit[0]).not.toBe(initial[0]);
  compilers[1].hooks.invalid.call();
  expect(compilers[0].watching.invalidate).toHaveBeenCalledTimes(1);
  const nodeEdit = compile();
  expect(nodeEdit[0]).toBe(nodeEdit[1]);
  expect(nodeEdit[0]).not.toBe(browserEdit[0]);
});

it('leaves production compilation identities unchanged', () => {
  const compiler = {
    options: { mode: 'production' },
    hooks: { thisCompilation: hook(), invalid: hook() },
  };
  createSharedBuildVersionPlugin().apply(compiler as any);
  const before = rs.mocked(setCompilationBuildVersion).mock.calls.length;
  compiler.hooks.thisCompilation.call({});
  expect(rs.mocked(setCompilationBuildVersion).mock.calls).toHaveLength(before);
});
