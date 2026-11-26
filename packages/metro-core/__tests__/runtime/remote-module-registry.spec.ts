import { readFileSync } from 'node:fs';
import path from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, rs } from '@rstest/core';
import ts from 'typescript';

type SharedModule = Record<string, unknown>;
type Factory = () => SharedModule;
type Registry = {
  loadSharedToRegistry: (id: string) => Promise<void> | void;
  getModuleFromRegistry: (id: string) => SharedModule;
};

const source = ts.transpileModule(
  readFileSync(path.resolve('src/runtime/remote-module-registry.js'), 'utf8'),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2021,
    },
  },
).outputText;

// a registry of its own for each test, on a runtime that provides `shared`
function createRegistry(
  shared: (
    registry: Registry,
  ) => Record<string, { eager: boolean; factory: Factory }>,
) {
  const module = { exports: {} as Registry };
  const loadShareSync = rs.fn((id: string) => provided[id].factory);
  const runtime = {
    getInstance: () => ({
      options: {
        shared: Object.fromEntries(
          Object.entries(provided).map(([id, { eager }]) => [
            id,
            [{ shareConfig: { eager } }],
          ]),
        ),
      },
    }),
    loadRemote: async () => ({}),
    loadShare: async (id: string) => provided[id].factory,
    loadShareSync,
  };

  runInNewContext(source, {
    __EARLY_MODULE_TEST__: /^react(-native(\/|$)|$)/,
    module,
    exports: module.exports,
    require: () => runtime,
  });

  const provided = shared(module.exports);
  return { registry: module.exports, loadShareSync };
}

describe('remote module registry', () => {
  it('gives a synchronous require an eager shared module that is still loading', async () => {
    const factory = rs.fn(() => ({ greeting: 'hello' }));
    const { registry } = createRegistry(() => ({
      pkg: { eager: true, factory },
    }));

    // the host loads its early shared modules, then its entry requires one
    const loaded = registry.loadSharedToRegistry('pkg');
    const required = registry.getModuleFromRegistry('pkg');
    expect(required.greeting).toBe('hello');

    await loaded;
    expect(registry.getModuleFromRegistry('pkg')).toBe(required);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('gives an eager shared module the one it requires while it loads', async () => {
    const { registry } = createRegistry((registry) => ({
      a: {
        eager: true,
        factory: () => ({
          greeting: (registry.getModuleFromRegistry('b').greet as Factory)(),
        }),
      },
      b: { eager: true, factory: () => ({ greet: () => 'hello from b' }) },
    }));

    await Promise.all(['a', 'b'].map(registry.loadSharedToRegistry));

    expect(registry.getModuleFromRegistry('a').greeting).toBe('hello from b');
  });

  it('leaves a shared module that is not eager to its async load', async () => {
    const { registry, loadShareSync } = createRegistry(() => ({
      pkg: { eager: false, factory: () => ({ greeting: 'hello' }) },
    }));

    const loaded = registry.loadSharedToRegistry('pkg');
    const required = registry.getModuleFromRegistry('pkg');
    expect(required.greeting).toBeUndefined();
    expect(loadShareSync).not.toHaveBeenCalled();

    await loaded;
    expect(required.greeting).toBe('hello');
  });
});
