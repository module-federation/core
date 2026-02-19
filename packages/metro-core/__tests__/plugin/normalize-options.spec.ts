import path from 'node:path';
import { vol } from 'memfs';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:fs', () => {
  const memfs = require('memfs').fs;
  return { ...memfs, default: memfs };
});

import { normalizeOptions } from '../../src/plugin/normalize-options';

let projectCount = 0;

function createProjectRoot() {
  projectCount += 1;
  const projectRoot = `/virtual/metro-core-${projectCount}`;
  vol.fromJSON({
    [path.join(projectRoot, 'package.json')]: JSON.stringify({
      dependencies: {
        react: '19.1.0',
        'react-native': '0.80.0',
      },
    }),
  });
  return projectRoot;
}

function getShared() {
  return {
    react: {
      singleton: true,
      eager: false,
      version: '19.1.0',
      requiredVersion: '19.1.0',
    },
    'react-native': {
      singleton: true,
      eager: false,
      version: '0.80.0',
      requiredVersion: '0.80.0',
    },
  };
}

describe('normalizeOptions', () => {
  afterEach(() => {
    vol.reset();
    vi.restoreAllMocks();
  });

  it('supports runtimePlugins as the primary config field', () => {
    const projectRoot = createProjectRoot();
    const tmpDirPath = path.join(projectRoot, 'node_modules', '.mf');
    vol.mkdirSync(tmpDirPath, { recursive: true });

    const runtimePluginPath = path.join(projectRoot, 'runtime-plugin.js');
    vol.writeFileSync(runtimePluginPath, 'module.exports = () => ({})');

    const normalized = normalizeOptions(
      {
        name: 'MetroHost',
        shared: getShared(),
        runtimePlugins: [runtimePluginPath],
      } as any,
      { projectRoot, tmpDirPath },
    );

    const metroCorePluginPath = require.resolve(
      '../../src/modules/metroCorePlugin.ts',
    );
    expect(normalized.plugins).toEqual([
      path.relative(tmpDirPath, metroCorePluginPath),
      path.relative(tmpDirPath, runtimePluginPath),
    ]);
  });

  it('deduplicates runtime plugins while preserving order', () => {
    const projectRoot = createProjectRoot();
    const tmpDirPath = path.join(projectRoot, 'node_modules', '.mf');
    vol.mkdirSync(tmpDirPath, { recursive: true });

    const runtimePluginPath = path.join(projectRoot, 'runtime-plugin.js');
    const runtimePluginTwoPath = path.join(
      projectRoot,
      'runtime-plugin-two.js',
    );
    vol.writeFileSync(runtimePluginPath, 'module.exports = () => ({})');
    vol.writeFileSync(runtimePluginTwoPath, 'module.exports = () => ({})');

    const normalized = normalizeOptions(
      {
        name: 'MetroHost',
        shared: getShared(),
        runtimePlugins: [
          runtimePluginPath,
          runtimePluginPath,
          runtimePluginTwoPath,
        ],
      } as any,
      { projectRoot, tmpDirPath },
    );

    const metroCorePluginPath = require.resolve(
      '../../src/modules/metroCorePlugin.ts',
    );
    expect(normalized.plugins).toEqual([
      path.relative(tmpDirPath, metroCorePluginPath),
      path.relative(tmpDirPath, runtimePluginPath),
      path.relative(tmpDirPath, runtimePluginTwoPath),
    ]);
  });
});
