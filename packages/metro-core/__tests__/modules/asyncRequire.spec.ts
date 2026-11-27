import { readFileSync } from 'node:fs';
import path from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, rs } from '@rstest/core';
import ts from 'typescript';

const source = readFileSync(
  path.resolve('src/modules/asyncRequire.ts'),
  'utf8',
);
const compiled = ts.transpileModule(
  `${source}\nmodule.exports = { encodeBundlePath };`,
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2021,
    },
  },
).outputText;

function loadAsyncRequire(globals: Record<string, unknown> = {}) {
  const module = {
    exports: {} as { encodeBundlePath: (bundlePath: string) => string },
  };
  const context: Record<string, any> = {
    __METRO_GLOBAL_PREFIX__: 'test',
    module,
    exports: module.exports,
    // babel-preset-expo inlines EXPO_OS, so under Expo it is always truthy
    process: { env: { EXPO_OS: 'android' } },
    require: () => ({}),
    ...globals,
  };
  context.global = context;
  context.globalThis = context;
  runInNewContext(compiled, context);
  return { context, ...module.exports };
}

describe('encodeBundlePath', () => {
  const { encodeBundlePath } = loadAsyncRequire();

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

describe('federation bundle loader', () => {
  const remoteEntry = 'http://remote:8082/remote.bundle?platform=ios';
  const federation = () => ({
    __NATIVE__: {
      test: {
        origin: 'http://host:8081/index.bundle',
        deps: { shared: {}, remotes: {} },
      },
    },
  });
  const requireBuilding = (builtLoader: unknown) => (name: string) =>
    name === '@expo/metro-runtime/src/async-require/buildAsyncRequire'
      ? { buildAsyncRequire: () => builtLoader }
      : {};

  it('stays installed when Expo assigns its loader afterwards, and loads through it', async () => {
    const { context } = loadAsyncRequire({ __FEDERATION__: federation() });
    const wrapper = context.test__loadBundleAsync;
    const expoLoader = rs.fn(async () => undefined);

    context.test__loadBundleAsync = expoLoader;

    expect(context.test__loadBundleAsync).toBe(wrapper);
    await wrapper(remoteEntry);
    expect(expoLoader).toHaveBeenCalledWith(remoteEntry);
  });

  it('builds a loader when nothing assigns one', async () => {
    const builtLoader = rs.fn(async () => undefined);
    const { context } = loadAsyncRequire({
      __FEDERATION__: federation(),
      require: requireBuilding(builtLoader),
    });

    await context.test__loadBundleAsync(remoteEntry);

    expect(builtLoader).toHaveBeenCalledWith(remoteEntry);
  });

  it("builds a loader in place of React Native's dev loader outside Expo", async () => {
    const reactNativeLoader = rs.fn(async () => undefined);
    const builtLoader = rs.fn(async () => undefined);
    const { context } = loadAsyncRequire({
      __FEDERATION__: federation(),
      process: { env: {} },
      // react-native's setUpDeveloperTools installs it before this module runs
      test__loadBundleAsync: reactNativeLoader,
      require: requireBuilding(builtLoader),
    });

    await context.test__loadBundleAsync(remoteEntry);

    expect(builtLoader).toHaveBeenCalledWith(remoteEntry);
    expect(reactNativeLoader).not.toHaveBeenCalled();
  });
});
