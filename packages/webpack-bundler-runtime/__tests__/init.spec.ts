/** @jest-environment node */
import * as runtime from '@module-federation/runtime';
import { init } from '../src/init';
import { initContainerEntry } from '../src/initContainerEntry';

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

it('isolates Node executions of one release and binds consumers to the container instance', async () => {
  const a = execution('a');
  const b = execution('b');
  a.federation.instance = init({ webpackRequire: a as any });
  b.federation.instance = init({ webpackRequire: b as any });
  try {
    expect(a.federation.instance).not.toBe(b.federation.instance);
    expect(a.federation.instance.options.id).not.toBe(
      b.federation.instance.options.id,
    );
    expect(a.federation.instance.loadShareSync('library')()).toBe('a');
    expect(b.federation.instance.loadShareSync('library')()).toBe('b');
    expect(init({ webpackRequire: a as any })).toBe(a.federation.instance);
    const bind = jest.fn();
    const options = {};
    Object.defineProperty(
      options,
      Symbol.for('module-federation.bind-provider'),
      { value: bind },
    );
    initContainerEntry({
      webpackRequire: b as any,
      shareScope: {},
      initScope: [],
      shareScopeKey: 'default',
      remoteEntryInitOptions: options,
    });
    expect(bind).toHaveBeenCalledWith(b.federation.instance);
    expect(
      (b.federation.instance.options as any)[
        Symbol.for('module-federation.bind-provider')
      ],
    ).toBeUndefined();
  } finally {
    await Promise.all([
      a.federation.instance.destroy(),
      b.federation.instance.destroy(),
    ]);
  }
});
