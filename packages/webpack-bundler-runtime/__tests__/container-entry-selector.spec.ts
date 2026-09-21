import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { clearImmediate, setImmediate } from 'node:timers';
import { TextDecoder, TextEncoder } from 'node:util';
import type webpack from 'webpack';
import { runNodeWithConditions } from '../../../tools/testing/runNodeWithConditions';

const packageDir = path.resolve(__dirname, '..');
type CompilerFactory = typeof webpack;
type StatsModule = {
  name?: string;
  identifier?: string;
  modules?: StatsModule[];
};

function compilerCases(): [string, CompilerFactory][] {
  Object.defineProperties(globalThis, {
    clearImmediate: { configurable: true, value: clearImmediate },
    setImmediate: { configurable: true, value: setImmediate },
    TextDecoder: { configurable: true, value: TextDecoder },
    TextEncoder: { configurable: true, value: TextEncoder },
  });
  return [
    [
      'webpack',
      createRequire(path.resolve(packageDir, '../enhanced/package.json'))(
        'webpack',
      ) as CompilerFactory,
    ],
    [
      'rspack',
      createRequire(path.resolve(packageDir, '../rspack/package.json'))(
        '@rspack/core',
      ) as CompilerFactory,
    ],
  ];
}

function flattenModules(modules: StatsModule[]): StatsModule[] {
  return modules.flatMap((module) => [
    module,
    ...flattenModules(module.modules ?? []),
  ]);
}

function compileRuntime(
  compilerFactory: CompilerFactory,
  compilerName: string,
  condition: string,
): Promise<string[]> {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-entry-selector-'));
  fs.writeFileSync(
    path.join(root, 'entry.js'),
    'import federation from "@module-federation/webpack-bundler-runtime";\nexport default federation;\n',
  );
  return new Promise((resolve, reject) => {
    const compiler = compilerFactory({
      context: packageDir,
      mode: 'production',
      entry: path.join(root, 'entry.js'),
      output: {
        path: path.join(root, compilerName),
        filename: 'out.js',
      },
      resolve: {
        alias: {
          '@module-federation/webpack-bundler-runtime': path.join(
            packageDir,
            'dist/index.js',
          ),
        },
        conditionNames: [condition, 'import', '...'],
      },
      optimization: {
        concatenateModules: false,
        minimize: true,
        usedExports: false,
      },
      externals: [
        (
          { request }: { request?: string },
          callback: (error?: Error | null, result?: string) => void,
        ) => {
          if (
            request?.startsWith('@module-federation/') &&
            request !== '@module-federation/webpack-bundler-runtime'
          ) {
            callback(null, `commonjs ${request}`);
            return;
          }
          callback();
        },
      ],
    });
    compiler.run((error, stats) => {
      compiler.close(() => undefined);
      fs.rmSync(root, { recursive: true, force: true });
      if (error) {
        reject(error);
        return;
      }
      const info = stats?.toJson({ modules: true });
      if (stats?.hasErrors()) {
        reject(new Error(info?.errors?.[0]?.message ?? 'compile failed'));
        return;
      }
      resolve(
        flattenModules((info?.modules ?? []) as unknown as StatsModule[]).map(
          (module) => module.name ?? module.identifier ?? '',
        ),
      );
    });
  });
}

describe('container entry selector', () => {
  it('keeps container initialization available by default', () => {
    expect(
      runNodeWithConditions(
        packageDir,
        [],
        "console.log(typeof require('#mf/container-entry').initContainerEntry)",
      ),
    ).toBe('function');
  });

  it('removes container initialization for the namespaced condition', () => {
    expect(
      runNodeWithConditions(
        packageDir,
        ['module-federation:no-container-entry'],
        "console.log(typeof require('#mf/container-entry').initContainerEntry)",
      ),
    ).toBe('undefined');
  });

  it('removes the tree-shaking plugin only when shared is disabled', () => {
    const code =
      "const { createTreeShakingSharePlugin } = require('#mf/tree-shaking-share-plugin'); console.log(createTreeShakingSharePlugin({ webpackRequire: { federation: {} } })?.name || 'none')";
    expect(runNodeWithConditions(packageDir, [], code)).toBe(
      'tree-shake-plugin',
    );
    expect(
      runNodeWithConditions(packageDir, ['module-federation:no-shared'], code),
    ).toBe('none');
  });

  it.each(compilerCases())(
    'removes the enabled entry from the %s graph',
    async (name, compiler) => {
      const modules = await compileRuntime(
        compiler,
        name,
        'module-federation:no-container-entry',
      );
      expect(modules).toContain('./dist/selectors/container-entry/disabled.js');
      expect(modules).not.toContain(
        './dist/selectors/container-entry/legacy.js',
      );
      expect(modules).not.toContain('./dist/initContainerEntry.js');
    },
  );

  it.each(compilerCases())(
    'removes shared adapters and the tree-shaking plugin from the %s graph',
    async (name, compiler) => {
      const modules = await compileRuntime(
        compiler,
        name,
        'module-federation:no-shared',
      );
      expect(modules).toContain(
        './dist/selectors/tree-shaking-share-plugin/disabled.js',
      );
      expect(modules).not.toContain(
        './dist/selectors/tree-shaking-share-plugin/legacy.js',
      );
      expect(modules).not.toContain('./dist/consumes.js');
      expect(modules).not.toContain('./dist/initializeSharing.js');
      expect(modules).not.toContain('./dist/installInitialConsumes.js');
      expect(modules).not.toContain('./dist/getSharedFallbackGetter.js');
    },
  );
});
