import { readFileSync } from 'node:fs';
import path from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, rs } from '@rstest/core';
import ts from 'typescript';

const source = readFileSync(path.resolve('src/runtime/remote-entry.js'), 'utf8')
  .replaceAll('__PLUGINS__', 'const plugins = []')
  .replaceAll('__REMOTES__', '[]')
  .replaceAll('__SHARED__', '{ lodash: {} }')
  .replaceAll('__EXPOSES_MAP__', '{}')
  .replaceAll('__NAME__', '"miniApp"')
  .replaceAll('__SHARE_STRATEGY__', '"loaded-first"')
  .replaceAll('__EARLY_SHARED__', '[]')
  .replaceAll('__DEV__', 'false');

describe('remote-entry init', () => {
  it('preloads only the shared deps this remote declares', async () => {
    const loadSharedToRegistry = rs.fn().mockResolvedValue(undefined);
    const instance = {
      initShareScopeMap: rs.fn(),
      initializeSharing: rs.fn(() => []),
    };
    const context: Record<string, unknown> = {
      exports: {},
      require: (request: string) => {
        switch (request) {
          case 'mf:async-require':
            return {};
          case 'mf:remote-module-registry':
            return { loadSharedToRegistry };
          case '@module-federation/runtime':
            return { init: () => instance };
          default:
            throw new Error(`Unexpected require: ${request}`);
        }
      },
    };
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

    const { init } = (
      context.__FEDERATION__ as {
        __NATIVE__: Record<
          string,
          {
            exports: {
              init: (shared: object, initScope: unknown[]) => Promise<unknown>;
            };
          }
        >;
      }
    ).__NATIVE__.miniApp.exports;
    // the host's share scope also provides moment, which this remote never declared
    await init({ lodash: {}, moment: {} }, []);

    expect(loadSharedToRegistry).toHaveBeenCalledTimes(1);
    expect(loadSharedToRegistry.mock.calls[0][0]).toBe('lodash');
  });
});
