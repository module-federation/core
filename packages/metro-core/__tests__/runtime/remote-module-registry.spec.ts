import { readFileSync } from 'node:fs';
import path from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, rs } from '@rstest/core';
import ts from 'typescript';

type SharedModule = Record<string, unknown>;
type Factory = () => SharedModule;
type Registry = {
  loadSharedToRegistry: (id: string) => Promise<void> | void;
};
type RequireShared = (id: string) => SharedModule;
type Provider = { lib?: Factory; shareConfig: { eager: boolean } };

function transpile(file: string) {
  return ts.transpileModule(readFileSync(path.resolve(file), 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2021,
    },
  }).outputText;
}

const registrySource = transpile('src/runtime/remote-module-registry.js');
// the module that an import of a shared module resolves to
const sharedModuleSource = transpile('src/runtime/remote-module.js');

// A registry of its own for each test, on a runtime that provides `shared`.
// `registered` adds providers of other containers to the share scope.
function createRegistry(
  shared: (
    requireShared: RequireShared,
  ) => Record<string, { eager: boolean; factory: Factory }>,
  registered: Record<string, Record<string, Provider>> = {},
) {
  const registryModule = { exports: {} as Registry };
  const loadShareSync = rs.fn((id: string) => provided[id].factory);
  const runtime = {
    getInstance: () => ({
      options: {
        shared: Object.fromEntries(
          Object.entries(provided).map(([id, { eager }]) => [
            id,
            [{ scope: ['default'], shareConfig: { eager } }],
          ]),
        ),
      },
      shareScopeMap: {
        default: Object.fromEntries(
          Object.entries(provided).map(([id, { eager }]) => [
            id,
            { '1.0.0': { shareConfig: { eager } }, ...registered[id] },
          ]),
        ),
      },
    }),
    loadRemote: async () => ({}),
    loadShare: async (id: string) => provided[id].factory,
    loadShareSync,
  };

  runInNewContext(registrySource, {
    __EARLY_MODULE_TEST__: /^react(-native(\/|$)|$)/,
    module: registryModule,
    exports: registryModule.exports,
    require: () => runtime,
  });

  // Metro's module cache: a require of a module that is still loading returns
  // what the module exports so far
  const modules: Record<string, { exports: SharedModule }> = {};
  const requireShared: RequireShared = (id) => {
    if (!modules[id]) {
      modules[id] = { exports: {} };
      runInNewContext(
        sharedModuleSource.replaceAll('__MODULE_ID__', JSON.stringify(id)),
        {
          module: modules[id],
          exports: modules[id].exports,
          require: () => registryModule.exports,
        },
      );
    }
    return modules[id].exports;
  };

  const provided = shared(requireShared);
  return { registry: registryModule.exports, requireShared, loadShareSync };
}

describe('remote module registry', () => {
  it('gives a synchronous require an eager shared module that is still loading', async () => {
    const factory = rs.fn(() => ({ greeting: 'hello' }));
    const { registry, requireShared } = createRegistry(() => ({
      pkg: { eager: true, factory },
    }));

    // the host loads its early shared modules, then its entry requires one
    const loaded = registry.loadSharedToRegistry('pkg');
    const required = requireShared('pkg');
    expect(required.greeting).toBe('hello');

    await loaded;
    expect(requireShared('pkg')).toBe(required);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('gives an eager shared module the one it requires while it loads', async () => {
    const { registry, requireShared } = createRegistry((requireShared) => ({
      a: {
        eager: true,
        factory: () => ({
          greeting: (requireShared('b').greet as Factory)(),
        }),
      },
      b: { eager: true, factory: () => ({ greet: () => 'hello from b' }) },
    }));

    await Promise.all(['a', 'b'].map(registry.loadSharedToRegistry));

    expect(requireShared('a').greeting).toBe('hello from b');
  });

  it('gives eager shared modules that require each other the loaded modules', async () => {
    const { registry, requireShared } = createRegistry((requireShared) => ({
      a: {
        eager: true,
        factory: () => {
          const b = requireShared('b');
          return { name: 'a', readB: () => b.name };
        },
      },
      b: {
        eager: true,
        factory: () => {
          const a = requireShared('a');
          return { name: 'b', readA: () => a.name };
        },
      },
    }));

    const loaded = ['a', 'b'].map(registry.loadSharedToRegistry);
    const a = requireShared('a');
    expect((a.readB as Factory)()).toBe('b');

    await Promise.all(loaded);
    expect((requireShared('b').readA as Factory)()).toBe('a');
  });

  it('fails the load of an eager shared module that throws when required', async () => {
    const { registry, requireShared } = createRegistry(() => ({
      pkg: {
        eager: true,
        factory: () => {
          throw new Error('boom');
        },
      },
    }));

    const loaded = Promise.resolve(registry.loadSharedToRegistry('pkg'));
    expect(() => requireShared('pkg')).toThrow('boom');

    await expect(loaded).rejects.toThrow('boom');
  });

  it('leaves a shared module that is not eager to its async load', async () => {
    const { registry, requireShared, loadShareSync } = createRegistry(() => ({
      pkg: { eager: false, factory: () => ({ greeting: 'hello' }) },
    }));

    const loaded = registry.loadSharedToRegistry('pkg');
    const required = requireShared('pkg');
    expect(required.greeting).toBeUndefined();
    expect(loadShareSync).not.toHaveBeenCalled();

    await loaded;
    expect(required.greeting).toBe('hello');
  });

  it('leaves an eager shared module to its async load while another provider is still to load', async () => {
    // a remote has registered its own version, which the async load can select
    const { registry, requireShared, loadShareSync } = createRegistry(
      () => ({ pkg: { eager: true, factory: () => ({ greeting: 'hello' }) } }),
      { pkg: { '1.2.0': { shareConfig: { eager: false } } } },
    );

    const loaded = registry.loadSharedToRegistry('pkg');
    const required = requireShared('pkg');
    expect(required.greeting).toBeUndefined();
    expect(loadShareSync).not.toHaveBeenCalled();

    await loaded;
    expect(required.greeting).toBe('hello');
  });
});
