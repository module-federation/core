import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
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
  let tmpDirPath: string | undefined;

  afterEach(() => {
    if (tmpDirPath) {
      fs.rmSync(tmpDirPath, { recursive: true, force: true });
      tmpDirPath = undefined;
    }
  });

  it('escapes Windows paths for require()', () => {
    tmpDirPath = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-metro-'));
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
