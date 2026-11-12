import { afterEach, expect, it } from '@rstest/core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { updateStatsAndManifest, type StatsAssetResource } from './manifest';

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0))
    fs.rmSync(directory, { recursive: true, force: true });
});
const assets = (version: string) =>
  ({
    stats: {
      filename: 'mf-stats.json',
      data: {
        metaData: {
          buildInfo: { buildVersion: version },
          remoteEntry: { name: 'entry.js' },
        },
      },
    },
    manifest: {
      filename: 'mf-manifest.json',
      data: {
        metaData: {
          buildInfo: { buildVersion: version },
          remoteEntry: { name: 'entry.js' },
        },
      },
    },
  }) as StatsAssetResource;

it('tracks one-sided builds without mutating retained compiler outputs', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-merge-'));
  directories.push(directory);
  const browser = assets('browser-1');
  const node = assets('node-1');
  const merge = (server = node, client = browser) => {
    updateStatsAndManifest(server, client, directory);
    const manifest = JSON.parse(
      fs.readFileSync(path.join(directory, 'mf-manifest.json'), 'utf8'),
    );
    const stats = JSON.parse(
      fs.readFileSync(path.join(directory, 'mf-stats.json'), 'utf8'),
    );
    expect(stats.metaData.buildInfo).toEqual(manifest.metaData.buildInfo);
    return manifest.metaData.buildInfo.buildVersion;
  };
  const first = merge();
  expect(merge()).toBe(first);
  const second = merge(assets('node-2'));
  expect(second).not.toBe(first);
  expect(merge(assets('node-2'))).toBe(second);
  expect(merge(node, assets('browser-2'))).not.toBe(first);
  expect(browser.manifest!.data.metaData.buildInfo.buildVersion).toBe(
    'browser-1',
  );
  expect(browser.manifest!.data.metaData.ssrRemoteEntry).toBeUndefined();
  expect(merge(assets('release-42'), assets('release-42'))).toBe('release-42');
});
