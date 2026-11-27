import { readFileSync } from 'node:fs';
import path from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from '@rstest/core';
import ts from 'typescript';

const source = readFileSync(
  path.resolve('src/modules/getDevServer.ts'),
  'utf8',
);
const module = { exports: {} as { default: () => unknown } };
const context: Record<string, unknown> = {
  __METRO_GLOBAL_PREFIX__: 'test',
  __FEDERATION__: {
    __NATIVE__: {
      test: { origin: 'http://remote:8082/repro_remote.bundle?platform=ios' },
    },
  },
  module,
  exports: module.exports,
};
context.global = context;
context.globalThis = context;

runInNewContext(
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2021,
    },
  }).outputText,
  context,
);

const getDevServer = module.exports.default;

describe('getDevServer', () => {
  it("returns the remote's dev server, loaded from the server", () => {
    expect(getDevServer()).toEqual({
      url: 'http://remote:8082/',
      fullBundleUrl: 'http://remote:8082/repro_remote.bundle?platform=ios',
      bundleLoadedFromServer: true,
    });
  });
});
