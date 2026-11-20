import { readFileSync } from 'node:fs';
import path from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, rs } from '@rstest/core';
import ts from 'typescript';

const source = readFileSync(
  path.resolve('src/runtime/remote-module-registry.js'),
  'utf8',
).replaceAll('__EARLY_MODULE_TEST__', '/^react(-native(\\/|$)|$)/');

type Registry = {
  loadAndGetShared: (id: string) => Promise<Record<string, unknown>>;
};

function loadRegistry(runtime: Record<string, unknown>): Registry {
  const module = { exports: {} as Registry };
  runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2021,
      },
    }).outputText,
    {
      module,
      exports: module.exports,
      require: (request: string) => {
        if (request !== '@module-federation/runtime') {
          throw new Error(`Unexpected require: ${request}`);
        }
        return runtime;
      },
    },
  );
  return module.exports;
}

describe('remote-module-registry loadAndGetShared', () => {
  it('rejects a missing share without caching it and retries later', async () => {
    const lodash = { name: 'lodash' };
    const loadShare = rs
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(() => lodash);
    const { loadAndGetShared } = loadRegistry({ loadShare });

    const first = loadAndGetShared('lodash');
    const concurrent = loadAndGetShared('lodash');
    await expect(first).rejects.toThrow(
      'Shared module lodash could not be loaded',
    );
    await expect(concurrent).rejects.toThrow(
      'Shared module lodash could not be loaded',
    );

    const module = await loadAndGetShared('lodash');
    expect(module.name).toBe('lodash');
    expect(loadShare).toHaveBeenCalledTimes(2);
  });

  it('retries after loadShare rejects', async () => {
    const lodash = { name: 'lodash' };
    const loadShare = rs
      .fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(() => lodash);
    const { loadAndGetShared } = loadRegistry({ loadShare });

    await expect(loadAndGetShared('lodash')).rejects.toThrow('network down');
    const module = await loadAndGetShared('lodash');
    expect(module.name).toBe('lodash');
    expect(loadShare).toHaveBeenCalledTimes(2);
  });

  it('caches a successful load', async () => {
    const lodash = { name: 'lodash' };
    const loadShare = rs.fn().mockResolvedValue(() => lodash);
    const { loadAndGetShared } = loadRegistry({ loadShare });

    const [first, second] = await Promise.all([
      loadAndGetShared('lodash'),
      loadAndGetShared('lodash'),
    ]);
    const third = await loadAndGetShared('lodash');

    expect(first.name).toBe('lodash');
    expect(second).toBe(first);
    expect(third).toBe(first);
    expect(loadShare).toHaveBeenCalledTimes(1);
  });
});
