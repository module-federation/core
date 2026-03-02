import path from 'node:path';
import { vol } from 'memfs';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:fs', () => {
  const memfs = require('memfs').fs;
  return { ...memfs, default: memfs };
});

import { toPosixPath } from '../../src/plugin/helpers';
import { normalizeOptions } from '../../src/plugin/normalize-options';

let projectCount = 0;
const DYNAMIC_REMOTE_TYPE_HINTS_PLUGIN =
  '@module-federation/dts-plugin/dynamic-remote-type-hints-plugin';

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

  it('defaults dts to false and does not inject type-hints plugin', () => {
    const projectRoot = createProjectRoot();
    const tmpDirPath = path.join(projectRoot, 'node_modules', '.mf');
    vol.mkdirSync(tmpDirPath, { recursive: true });

    const normalized = normalizeOptions(
      {
        name: 'MetroHost',
        shared: getShared(),
      } as any,
      { projectRoot, tmpDirPath },
    );

    expect(normalized.dts).toBe(false);
    expect(normalized.plugins).not.toContain(DYNAMIC_REMOTE_TYPE_HINTS_PLUGIN);
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
      toPosixPath(path.relative(tmpDirPath, metroCorePluginPath)),
      toPosixPath(path.relative(tmpDirPath, runtimePluginPath)),
    ]);
  });

  it('resolves non-dot local runtime plugin paths from project root', () => {
    const projectRoot = createProjectRoot();
    const tmpDirPath = path.join(projectRoot, 'node_modules', '.mf');
    vol.mkdirSync(tmpDirPath, { recursive: true });

    const runtimePluginPath = path.join(projectRoot, 'runtime-plugin.js');
    vol.writeFileSync(runtimePluginPath, 'module.exports = () => ({})');

    const normalized = normalizeOptions(
      {
        name: 'MetroHost',
        shared: getShared(),
        runtimePlugins: ['runtime-plugin.js'],
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

  it('resolves nested non-dot local runtime plugin paths from project root', () => {
    const projectRoot = createProjectRoot();
    const tmpDirPath = path.join(projectRoot, 'node_modules', '.mf');
    vol.mkdirSync(tmpDirPath, { recursive: true });

    const runtimePluginPath = path.join(projectRoot, 'plugins', 'my-plugin.ts');
    vol.mkdirSync(path.dirname(runtimePluginPath), { recursive: true });
    vol.writeFileSync(runtimePluginPath, 'module.exports = () => ({})');

    const normalized = normalizeOptions(
      {
        name: 'MetroHost',
        shared: getShared(),
        runtimePlugins: ['plugins/my-plugin.ts'],
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

  it('keeps bare package runtime plugin specifiers unchanged', () => {
    const projectRoot = createProjectRoot();
    const tmpDirPath = path.join(projectRoot, 'node_modules', '.mf');
    vol.mkdirSync(tmpDirPath, { recursive: true });

    const normalized = normalizeOptions(
      {
        name: 'MetroHost',
        shared: getShared(),
        runtimePlugins: ['@scope/pkg/plugin', 'pkg-name'],
      } as any,
      { projectRoot, tmpDirPath },
    );

    const metroCorePluginPath = require.resolve(
      '../../src/modules/metroCorePlugin.ts',
    );
    expect(normalized.plugins).toEqual([
      path.relative(tmpDirPath, metroCorePluginPath),
      '@scope/pkg/plugin',
      'pkg-name',
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
      toPosixPath(path.relative(tmpDirPath, metroCorePluginPath)),
      toPosixPath(path.relative(tmpDirPath, runtimePluginPath)),
      toPosixPath(path.relative(tmpDirPath, runtimePluginTwoPath)),
    ]);
  });

  it('keeps dts enabled without injecting extra runtime plugins', () => {
    const projectRoot = createProjectRoot();
    const tmpDirPath = path.join(projectRoot, 'node_modules', '.mf');
    vol.mkdirSync(tmpDirPath, { recursive: true });

    const normalized = normalizeOptions(
      {
        name: 'MetroHost',
        shared: getShared(),
        dts: true,
      } as any,
      { projectRoot, tmpDirPath },
    );

    expect(normalized.dts).toBe(true);
    expect(normalized.plugins).not.toContain(DYNAMIC_REMOTE_TYPE_HINTS_PLUGIN);
  });
});
