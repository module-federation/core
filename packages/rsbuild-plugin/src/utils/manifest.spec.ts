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
const assets = (buildVersion = 'release-42') =>
  ({
    stats: {
      filename: 'mf-stats.json',
      data: {
        metaData: {
          buildInfo: { buildVersion },
          remoteEntry: { name: 'entry.js' },
        },
      },
    },
    manifest: {
      filename: 'mf-manifest.json',
      data: {
        metaData: {
          buildInfo: { buildVersion },
          remoteEntry: { name: 'entry.js' },
        },
      },
    },
  }) as StatsAssetResource;

it('merges both entries with the shared application version without mutating compiler outputs', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-merge-'));
  directories.push(directory);
  const browser = assets();
  const node = assets();
  node.manifest!.data.metaData.remoteEntry.name = 'server.js';
  node.stats!.data.metaData.remoteEntry.name = 'server.js';
  updateStatsAndManifest(node, browser, directory);
  for (const filename of ['mf-manifest.json', 'mf-stats.json']) {
    const merged = JSON.parse(
      fs.readFileSync(path.join(directory, filename), 'utf8'),
    );
    expect(merged.metaData.buildInfo.buildVersion).toBe('release-42');
    expect(merged.metaData.remoteEntry.name).toBe('entry.js');
    expect(merged.metaData.ssrRemoteEntry).toEqual({ name: 'server.js' });
  }
  expect(browser.manifest!.data.metaData.ssrRemoteEntry).toBeUndefined();
  expect(browser.stats!.data.metaData.ssrRemoteEntry).toBeUndefined();
});
