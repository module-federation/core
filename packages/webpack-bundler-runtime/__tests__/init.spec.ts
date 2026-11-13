/** @jest-environment node */
import * as runtime from '@module-federation/runtime';
import { init } from '../src/init';

function execution(value: string) {
  return {
    federation: {
      instance: undefined as runtime.ModuleFederation | undefined,
      initOptions: {
        name: 'same-provider',
        id: 'same-provider:release-1',
        remotes: [],
        shared: { library: { version: '1.0.0', lib: () => value } },
      },
      runtime,
      bundlerRuntimeOptions: { remotes: {} },
    },
    S: {},
    I: jest.fn(),
    m: {},
    c: {},
  };
}

it('reuses the same provider build across Node evaluations', async () => {
  const a = execution('a');
  const b = execution('a');
  a.federation.instance = init({ webpackRequire: a as any });
  b.federation.instance = init({ webpackRequire: b as any });
  try {
    expect(a.federation.instance).toBe(b.federation.instance);
    expect(a.federation.instance.options.id).toBe('same-provider:release-1');
    expect(a.federation.instance.loadShareSync('library')()).toBe('a');
    expect(b.federation.instance.loadShareSync('library')()).toBe('a');
    expect(init({ webpackRequire: a as any })).toBe(a.federation.instance);
  } finally {
    await Promise.all([
      a.federation.instance.destroy(),
      b.federation.instance.destroy(),
    ]);
  }
});
