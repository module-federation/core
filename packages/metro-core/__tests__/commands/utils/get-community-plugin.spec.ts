import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from '@rstest/core';
import { getCommunityCliPlugin } from '../../../src/commands/utils/get-community-plugin';

describe('getCommunityCliPlugin', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-metro-cli-plugin-'));

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('finds the plugin next to a symlinked react-native', () => {
    // pnpm layout: the project links to react-native in the store, and the
    // dependencies of react-native are only installed next to it there
    const storeModules = path.join(tmpDir, 'store/react-native/node_modules');
    const pluginDir = path.join(
      storeModules,
      '@react-native/community-cli-plugin',
    );
    fs.mkdirSync(path.join(storeModules, 'react-native'), { recursive: true });
    fs.mkdirSync(pluginDir, { recursive: true });
    fs.writeFileSync(
      path.join(pluginDir, 'index.js'),
      "module.exports = { name: 'fixture-plugin' };",
    );

    const projectModules = path.join(tmpDir, 'project/node_modules');
    const reactNativePath = path.join(projectModules, 'react-native');
    fs.mkdirSync(projectModules, { recursive: true });
    fs.symlinkSync(
      path.join(storeModules, 'react-native'),
      reactNativePath,
      'junction',
    );

    expect(getCommunityCliPlugin(reactNativePath)).toEqual({
      name: 'fixture-plugin',
    });
  });
});
