/// <reference types="jest" />

import path from 'path';
import fs from 'fs';
import { BabelFileResult, transformFileSync } from '@babel/core';
// @ts-ignore no use
import type from '@types/jest';

import babelPlugin from '../src/cli/babel';

const emptyRegexp = /\s+/g;
describe('Babel Plugin Test', () => {
  const options = {
    name: '@mf/test',
    exposes: { './expose': path.resolve(__dirname, 'test') },
  };

  const testFilePath = path.join(__dirname, './test');

  beforeEach(() => {
    fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
    fs.closeSync(fs.openSync(testFilePath, 'w'));
  });

  afterEach(() => {
    fs.unlinkSync(testFilePath);
  });

  // Check if the plugin will add the id parameter when it is not present
  test('it adds id argument to usePrefetch call when it is absent', () => {
    const input = `
      import { usePrefetch } from "@module-federation/data-prefetch/react";
      usePrefetch({});
    `;

    const expected = `
      import { usePrefetch } from "@module-federation/data-prefetch/react";
      usePrefetch({ id: "@mf/test/expose" });
    `;

    fs.writeFileSync(testFilePath, input);
    const { code } = transformFileSync(testFilePath, {
      plugins: [[babelPlugin, options]],
      configFile: false,
    }) as BabelFileResult;

    expect(code?.replace(emptyRegexp, '')).toBe(
      expected.replace(emptyRegexp, ''),
    );
  });

  // The plugin should retain the existing id parameter in the usePrefetch call
  test('it does not overwrite existing id argument in usePrefetch call', () => {
    const input = `
      import { usePrefetch } from "@module-federation/data-prefetch/react";
      usePrefetch({ id: "existingId" });
    `;

    const expected = `
      import { usePrefetch } from "@module-federation/data-prefetch/react";
      usePrefetch({ id: "existingId" });
    `;

    fs.writeFileSync(testFilePath, input);
    const { code } = transformFileSync(testFilePath, {
      plugins: [[babelPlugin, options]],
      configFile: false,
      babelrc: false,
    }) as BabelFileResult;

    expect(code?.replace(emptyRegexp, '')).toBe(
      expected.replace(emptyRegexp, ''),
    );
  });
});
