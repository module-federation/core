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
  expect(entry.assets).toEqual({
    js: { sync: [], async: [] },
    css: { sync: [], async: [] },
  });
};

for (const [name, { shared, exposes }] of Object.entries({ stats, manifest })) {
  it(`should preserve shared names and scopes without asset details in ${name}`, () => {
    expect(shared).toHaveLength(3);
    expect(shared).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'react',
          layer: 'server',
          shareScope: ['server', 'default'],
        }),
        expect.objectContaining({
          id: 'container:react',
          name: 'react',
          shareScope: 'canary',
          version: '1.0.0',
          requiredVersion: false,
        }),
        expect.objectContaining({
          id: 'container:react',
          name: 'react',
          shareScope: 'default',
          version: '1.0.0',
          requiredVersion: '1.0.0',
        }),
      ]),
    );
    shared.forEach(expectEmptyAssets);
    expect(exposes).toHaveLength(1);
    expectEmptyAssets(exposes[0]);
    expect(exposes[0].layer).toBe('server');
  });
}

it('should mark remote usage locations as UNKNOWN', () => {
  const remote = stats.remotes.find((item) => item.alias === 'remote');
  expect(remote).toBeTruthy();
  const usedIn = remote ? remote.usedIn : [];
  expect([['UNKNOWN'], []]).toContainEqual(usedIn);
});
