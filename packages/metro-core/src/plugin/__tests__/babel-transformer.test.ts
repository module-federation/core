import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createBabelTransformer } from '../babel-transformer';
import type { ModuleFederationConfigNormalized } from '../../types';

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
  it('escapes Windows paths for require()', () => {
    const tmpDirPath = fs.mkdtempSync(
      path.join(os.tmpdir(), 'mf-metro-'),
    );
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

    fs.rmSync(tmpDirPath, { recursive: true, force: true });
  });
});
