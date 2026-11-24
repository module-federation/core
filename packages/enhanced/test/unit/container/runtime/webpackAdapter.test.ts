/*
 * @rstest-environment node
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  getActiveWebpack,
  getRuntimeGlobals,
  getRuntimeModule,
  getWebpack,
  getWebpackApi,
  setActiveWebpack,
  type WebpackPublicApi,
} from '../../../../src/lib/webpack';

describe('webpack public API adapter', () => {
  let previousWebpackPath: string | undefined;

  beforeEach(() => {
    previousWebpackPath = process.env['FEDERATION_WEBPACK_PATH'];
    setActiveWebpack(undefined);
  });

  afterEach(() => {
    setActiveWebpack(undefined);
    if (previousWebpackPath === undefined) {
      delete process.env['FEDERATION_WEBPACK_PATH'];
    } else {
      process.env['FEDERATION_WEBPACK_PATH'] = previousWebpackPath;
    }
  });

  it('prefers compiler.webpack over activeWebpack and FEDERATION_WEBPACK_PATH', () => {
    const compilerWebpack = { version: 'compiler-mock' } as any;
    const activeMock = { version: 'active-mock' } as any;

    setActiveWebpack(activeMock);
    expect(getWebpack({ webpack: compilerWebpack })).toBe(compilerWebpack);
    expect(getWebpack()).toBe(activeMock);
    expect(getActiveWebpack()).toBe(activeMock);
  });

  it('falls back to FEDERATION_WEBPACK_PATH when neither compiler nor activeWebpack is set', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-wp-adapter-'));
    try {
      const fakeEntry = path.join(tmpDir, 'lib/index.js');
      fs.mkdirSync(path.dirname(fakeEntry), { recursive: true });
      fs.writeFileSync(
        fakeEntry,
        'module.exports = { version: "custom-env-webpack" };',
      );
      process.env['FEDERATION_WEBPACK_PATH'] = fakeEntry;

      const resolved = getWebpack();
      expect(resolved.version).toBe('custom-env-webpack');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('returns public API directly without touching legacy private paths', () => {
    const publicSemver = {
      satisfy: () => true,
      parseRange: () => [],
    };
    const publicGetUndoPath = () => '../../';
    const fakeWebpack = {
      sharing: { semver: publicSemver },
      util: { getUndoPath: publicGetUndoPath },
    } as unknown as WebpackPublicApi;

    // Point FEDERATION_WEBPACK_PATH to a non-existent directory so any legacy
    // fallback attempt would throw MODULE_NOT_FOUND immediately.
    process.env['FEDERATION_WEBPACK_PATH'] = path.join(
      os.tmpdir(),
      'mf-non-existent-webpack-dir/lib/index.js',
    );

    expect(
      getWebpackApi(
        fakeWebpack,
        (w) => w.sharing?.semver,
        'webpack/lib/util/semver',
      ),
    ).toBe(publicSemver);

    expect(
      getWebpackApi(
        fakeWebpack,
        (w) => w.util?.getUndoPath,
        'webpack/lib/util/identifier',
        (m: typeof import('webpack/lib/util/identifier')) => m.getUndoPath,
      ),
    ).toBe(publicGetUndoPath);
  });

  it('falls back to normalizeWebpackPath when public API is unavailable on legacy webpack', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-wp-legacy-'));
    try {
      const fakeEntry = path.join(tmpDir, 'lib/index.js');
      const legacySemver = path.join(tmpDir, 'lib/util/semver.js');
      const legacyIdentifier = path.join(tmpDir, 'lib/util/identifier.js');
      fs.mkdirSync(path.dirname(legacySemver), { recursive: true });
      fs.writeFileSync(fakeEntry, 'module.exports = {};');
      fs.writeFileSync(
        legacySemver,
        'module.exports = { satisfy: () => "legacy-semver" };',
      );
      fs.writeFileSync(
        legacyIdentifier,
        'module.exports = { getUndoPath: () => "../legacy/" };',
      );
      process.env['FEDERATION_WEBPACK_PATH'] = fakeEntry;

      const legacyWebpack = {} as WebpackPublicApi;
      const semver = getWebpackApi(
        legacyWebpack,
        (w) => w.sharing?.semver,
        'webpack/lib/util/semver',
      );
      expect((semver as any).satisfy()).toBe('legacy-semver');

      const getUndoPath = getWebpackApi(
        legacyWebpack,
        (w) => w.util?.getUndoPath,
        'webpack/lib/util/identifier',
        (m: typeof import('webpack/lib/util/identifier')) => m.getUndoPath,
      );
      expect(getUndoPath('', '', false)).toBe('../legacy/');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('prefers webpack.runtime.{RuntimeGlobals,RuntimeModule} over top-level deprecated getters', () => {
    const runtimeGlobals = { require: '__new_req__' } as any;
    const legacyGlobals = { require: '__old_req__' } as any;
    const runtimeModule = class NewRuntimeModule {} as any;
    const legacyModule = class OldRuntimeModule {} as any;

    const webpackWithRuntime = {
      runtime: {
        RuntimeGlobals: runtimeGlobals,
        RuntimeModule: runtimeModule,
      },
      RuntimeGlobals: legacyGlobals,
      RuntimeModule: legacyModule,
    } as unknown as WebpackPublicApi;

    expect(getRuntimeGlobals(webpackWithRuntime)).toBe(runtimeGlobals);
    expect(getRuntimeModule(webpackWithRuntime)).toBe(runtimeModule);

    const legacyWebpack = {
      RuntimeGlobals: legacyGlobals,
      RuntimeModule: legacyModule,
    } as unknown as WebpackPublicApi;

    expect(getRuntimeGlobals(legacyWebpack)).toBe(legacyGlobals);
    expect(getRuntimeModule(legacyWebpack)).toBe(legacyModule);
  });

  it('binds compiler.webpack in BaseWrapperPlugin.apply before lazily requiring core plugin', () => {
    const packageRoot = path.resolve(__dirname, '../../../..');
    const distWrapper = path.join(
      packageRoot,
      'dist/src/wrapper/BaseWrapperPlugin.js',
    );
    const distWebpackAdapter = path.join(
      packageRoot,
      'dist/src/lib/webpack.js',
    );
    if (!fs.existsSync(distWrapper)) {
      return;
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-wrapper-order-'));
    try {
      const coreModulePath = path.join(tmpDir, 'CoreTestPlugin.cjs');
      fs.writeFileSync(
        coreModulePath,
        `const { getWebpack } = require(${JSON.stringify(distWebpackAdapter)});
         const capturedAtLoadTime = getWebpack();
         class CoreTestPlugin {
           constructor(options) { this.options = options; }
           apply(compiler) {
             compiler.__capturedAtLoadTime = capturedAtLoadTime;
           }
         }
         module.exports = { default: CoreTestPlugin };`,
      );

      const script = `
        const BaseWrapperPlugin = require(${JSON.stringify(distWrapper)}).default;
        const { getActiveWebpack } = require(${JSON.stringify(distWebpackAdapter)});
        class TestWrapperPlugin extends BaseWrapperPlugin {
          constructor() {
            super({}, 'TestWrapperPlugin', ${JSON.stringify(coreModulePath)});
          }
        }
        const customWebpack = Object.assign(() => undefined, {
          version: '5.113.0-mock',
        });
        const compiler = { webpack: customWebpack };
        new TestWrapperPlugin().apply(compiler);
        process.stdout.write(JSON.stringify({
          matchedAtLoadTime: compiler.__capturedAtLoadTime === customWebpack,
          matchedActiveWebpack: getActiveWebpack() === customWebpack,
        }));
      `;

      const output = execFileSync(process.execPath, ['-e', script], {
        cwd: packageRoot,
        encoding: 'utf8',
      });
      expect(JSON.parse(output)).toEqual({
        matchedAtLoadTime: true,
        matchedActiveWebpack: true,
      });
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('supports pre-initialization access to enhanced.container.ContainerEntryModule and dependencies.ContainerEntryDependency', () => {
    const packageRoot = path.resolve(__dirname, '../../../..');
    const distEntry = path.join(packageRoot, 'dist/src/index.js');
    if (!fs.existsSync(distEntry)) {
      return;
    }

    const script = `
      const webpack = require(process.env.FEDERATION_WEBPACK_PATH || 'webpack');
      const enhanced = require(${JSON.stringify(distEntry)});
      const { ContainerEntryDependency } = enhanced.dependencies;
      const { ContainerEntryModule } = enhanced.container;
      const dep = new ContainerEntryDependency('app', [], 'default', '');
      const mod = new ContainerEntryModule('app', [], 'default', '');
      process.stdout.write(JSON.stringify({
        depIsDependency: dep instanceof webpack.Dependency,
        modIsModule: mod instanceof webpack.Module,
      }));
    `;

    const output = execFileSync(process.execPath, ['-e', script], {
      cwd: packageRoot,
      encoding: 'utf8',
    });
    expect(JSON.parse(output)).toEqual({
      depIsDependency: true,
      modIsModule: true,
    });
  });
});
