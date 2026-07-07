import fs from 'node:fs';
import path from 'node:path';
import { vol } from 'memfs';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { createBabelTransformer } from '../../src/plugin/babel-transformer';
import type { ModuleFederationConfigNormalized } from '../../src/types';

function createConfig(): ModuleFederationConfigNormalized {
  return {
    name: 'test-app',
    filename: 'remote.js',
    remotes: {},
    exposes: {},
    shared: {},
    shareStrategy: 'loaded-first',
    plugins: [],
  };
}

describe('createBabelTransformer', () => {
  afterEach(() => {
    vol.reset();
    rs.restoreAllMocks();
  });

  it('escapes Windows paths for require()', () => {
    const realReadFileSync = fs.readFileSync.bind(fs);
    rs.spyOn(fs, 'readFileSync').mockImplementation(((filePath, options) => {
      const targetPath = filePath.toString();
      if (vol.existsSync(targetPath)) {
        return vol.readFileSync(targetPath, options as never);
      }
      return realReadFileSync(filePath, options as never);
    }) as typeof fs.readFileSync);
    rs.spyOn(fs, 'writeFileSync').mockImplementation(((
      filePath,
      data,
      options,
    ) => {
      const targetPath = filePath.toString();
      vol.mkdirSync(path.dirname(targetPath), { recursive: true });
      vol.writeFileSync(targetPath, data, options as never);
    }) as typeof fs.writeFileSync);

    const tmpDirPath = path.join('/virtual', '.mf');
    vol.mkdirSync(tmpDirPath, { recursive: true });
    const windowsPath =
      'C:\\Users\\someone\\project\\node_modules\\metro-babel-transformer\\src\\index.js';

    const outputPath = createBabelTransformer({
      blacklistedPaths: [],
      federationConfig: createConfig(),
      originalBabelTransformerPath: windowsPath,
      tmpDirPath,
      enableInitializeCorePatching: false,
      enableRuntimeRequirePatching: false,
    });

    const output = fs.readFileSync(outputPath, 'utf-8');
    expect(output).toContain(`require(${JSON.stringify(windowsPath)})`);
  });
});
