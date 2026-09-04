import { createRequire } from 'node:module';
import { describe, expect, it } from '@rstest/core';

const require = createRequire(import.meta.url);
const { transformSync } = require('@babel/core');
const patchInitializeCore = require('../../babel-plugin/patch-initialize-core');

function transform(filename: string) {
  const result = transformSync(
    `
      'use strict';
      require('./setUpGlobals');
    `,
    {
      babelrc: false,
      configFile: false,
      filename,
      plugins: [patchInitializeCore],
    },
  );

  return result?.code ?? '';
}

describe('patch-initialize-core babel plugin', () => {
  it('injects init-host with POSIX paths', () => {
    const code = transform(
      '/repo/node_modules/react-native/Libraries/Core/InitializeCore.js',
    );

    expect(code).toContain('require("mf:init-host")');
  });

  it('injects init-host with Windows paths', () => {
    const code = transform(
      'C:\\repo\\node_modules\\react-native\\Libraries\\Core\\InitializeCore.js',
    );

    expect(code).toContain('require("mf:init-host")');
  });
});
