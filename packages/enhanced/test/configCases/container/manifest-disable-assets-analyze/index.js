const fs = __non_webpack_require__('fs');
const path = __non_webpack_require__('path');

const statsPath = path.join(__dirname, 'mf-stats.json');
const manifestPath = path.join(__dirname, 'mf-manifest.json');

const stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

it('should still emit the remote entry', () => {
  const remoteEntryFile = stats.metaData.remoteEntry.name;
  const remoteEntryPath = path.join(__dirname, remoteEntryFile);
  expect(fs.existsSync(remoteEntryPath)).toBe(true);
});

const expectEmptyAssets = (entry) => {
  expect(entry.assets.js.sync).toEqual([]);
  expect(entry.assets.js.async).toEqual([]);
};

it('should omit asset details from stats when disableAssetsAnalyze is true', () => {
  if (stats.shared.length) {
    expect(stats.shared).toHaveLength(1);
    expectEmptyAssets(stats.shared[0]);
  } else {
    expect(stats.shared).toEqual([]);
  }
  expect(stats.exposes).toHaveLength(1);
  expectEmptyAssets(stats.exposes[0]);
});

it('should omit asset details from manifest when disableAssetsAnalyze is true', () => {
  if (manifest.shared.length) {
    expect(manifest.shared).toHaveLength(1);
    expectEmptyAssets(manifest.shared[0]);
  } else {
    expect(manifest.shared).toEqual([]);
  }
  expect(manifest.exposes).toHaveLength(1);
  expectEmptyAssets(manifest.exposes[0]);
});

it('should mark remote usage locations as UNKNOWN', () => {
  const remote = stats.remotes.find((item) => item.alias === 'remote');
  const usedIn = remote ? remote.usedIn : [];
  expect([['UNKNOWN'], []]).toContainEqual(usedIn);
});
