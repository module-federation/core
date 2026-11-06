import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Compiler } from 'webpack';
import { getWebpack, getWebpackModule } from '../../src/lib/webpack';

describe('webpack API compatibility', () => {
  let directory: string;
  let webpackPath: string | undefined;

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-webpack-api-'));
    webpackPath = process.env.FEDERATION_WEBPACK_PATH;
    delete process.env.FEDERATION_WEBPACK_PATH;
  });

  afterEach(() => {
    if (webpackPath === undefined) {
      delete process.env.FEDERATION_WEBPACK_PATH;
    } else {
      process.env.FEDERATION_WEBPACK_PATH = webpackPath;
    }
    fs.rmSync(directory, { recursive: true, force: true });
  });

  function moduleFile(name: string, source: string) {
    const file = path.join(directory, `${name}.cjs`);
    fs.writeFileSync(file, source);
    return file;
  }

  it('uses the applying compiler even when another webpack path is configured', () => {
    process.env.FEDERATION_WEBPACK_PATH = path.join(directory, 'missing.cjs');
    const webpack = { version: 'compiler-instance' };
    expect(getWebpack({ webpack } as Compiler)).toBe(webpack);
  });

  it('supports public container exports before a compiler is created', () => {
    process.env.FEDERATION_WEBPACK_PATH = moduleFile(
      'selected-webpack',
      'module.exports = { version: "selected-instance" };',
    );
    expect(getWebpack().version).toBe('selected-instance');
  });

  it('does not resolve private files when the public API is available', () => {
    const publicExport = () => 'public';
    expect(
      getWebpackModule(
        publicExport,
        path.join(directory, 'missing-legacy.cjs'),
        path.join(directory, 'missing-relocated.cjs'),
      ),
    ).toBe(publicExport);
  });

  it('loads legacy files on older webpack releases', () => {
    const legacy = moduleFile('legacy', 'module.exports = "legacy";');
    const relocated = moduleFile('relocated', 'throw new Error("unused");');
    expect(getWebpackModule(undefined, legacy, relocated)).toBe('legacy');
  });

  it('loads relocated files on webpack 5.112 releases without the new API', () => {
    const relocated = moduleFile('relocated', 'module.exports = "relocated";');
    expect(
      getWebpackModule(
        undefined,
        path.join(directory, 'missing-legacy.cjs'),
        relocated,
      ),
    ).toBe('relocated');
  });

  it('resolves fallbacks relative to the selected compiler installation', () => {
    const lib = path.join(directory, 'selected', 'lib');
    fs.mkdirSync(path.join(lib, 'sharing'), { recursive: true });
    fs.writeFileSync(path.join(lib, 'index.js'), 'module.exports = {};');
    fs.writeFileSync(
      path.join(lib, 'sharing', 'semver.js'),
      'module.exports = "selected-semver";',
    );
    process.env.FEDERATION_WEBPACK_PATH = path.join(lib, 'index.js');
    expect(
      getWebpackModule(
        undefined,
        'webpack/lib/util/semver',
        'webpack/lib/sharing/semver',
      ),
    ).toBe('selected-semver');
  });

  it('preserves errors thrown while executing a resolved legacy module', () => {
    const legacy = moduleFile(
      'legacy',
      'require("missing-mf-api-dependency");',
    );
    const relocated = moduleFile('relocated', 'module.exports = "unused";');
    expect(() => getWebpackModule(undefined, legacy, relocated)).toThrow(
      'missing-mf-api-dependency',
    );
  });

  it('does not mask resolution errors other than MODULE_NOT_FOUND', () => {
    const legacy = path.join(directory, 'legacy');
    fs.mkdirSync(legacy);
    fs.writeFileSync(path.join(legacy, 'package.json'), '{ invalid json');
    const relocated = moduleFile('relocated', 'module.exports = "unused";');
    expect(() => getWebpackModule(undefined, legacy, relocated)).toThrow();
  });

  it('reports missing modules when neither layout is installed', () => {
    expect(() =>
      getWebpackModule(
        undefined,
        path.join(directory, 'legacy.cjs'),
        path.join(directory, 'relocated.cjs'),
      ),
    ).toThrow('relocated.cjs');
  });
});
