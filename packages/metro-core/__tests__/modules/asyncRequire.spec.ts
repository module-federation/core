import { readFileSync } from 'node:fs';
import path from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from '@rstest/core';
import ts from 'typescript';

const source = readFileSync(
  path.resolve('src/modules/asyncRequire.ts'),
  'utf8',
);
const module = {
  exports: {} as { encodeBundlePath: (bundlePath: string) => string },
};
const context: Record<string, unknown> = {
  __METRO_GLOBAL_PREFIX__: 'test',
  module,
  exports: module.exports,
  process: { env: { EXPO_OS: 'android' } },
  require: () => ({}),
  test__loadBundleAsync: () => undefined,
};
context.global = context;
context.globalThis = context;

runInNewContext(
  ts.transpileModule(`${source}\nmodule.exports = { encodeBundlePath };`, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2021,
    },
  }).outputText,
  context,
);

const { encodeBundlePath } = module.exports;

describe('encodeBundlePath', () => {
  it('preserves POSIX parent segments in bundle URLs', () => {
    expect(
      encodeBundlePath(
        '/../../node_modules/@repro/hoisted/dist/module/index.bundle',
      ),
    ).toBe('/..%2F..%2Fnode_modules/@repro/hoisted/dist/module/index.bundle');
  });

  it('preserves Windows parent segments in bundle URLs', () => {
    expect(
      encodeBundlePath(
        '/..\\..\\node_modules\\@repro\\hoisted\\dist\\module\\index.bundle',
      ),
    ).toBe('/..%2F..%2Fnode_modules/@repro/hoisted/dist/module/index.bundle');
  });
});
