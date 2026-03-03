const fs = __non_webpack_require__('fs');
const path = __non_webpack_require__('path');

const statsPath = path.join(__dirname, 'mf-stats.json');
const stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));

it('should have one expose entry', () => {
  expect(stats.exposes).toHaveLength(1);
  expect(stats.exposes[0].path).toBe('./expose-a');
});

it('should collect all expose chunk assets even when split by splitChunks.maxSize', () => {
  const syncFiles = stats.exposes[0].assets.js.sync;

  // Discover every JS file webpack actually emitted for this expose chunk.
  // Split chunks produced by maxSize are named "__federation_expose_expose_a-<hash>.js",
  // so we match on the expose chunk name prefix.
  const exposeChunkPrefix = '__federation_expose_expose_a';
  const emittedExposeFiles = fs
    .readdirSync(__dirname)
    .filter((f) => f.startsWith(exposeChunkPrefix) && f.endsWith('.js'));

  // At least the primary expose chunk must exist
  expect(emittedExposeFiles.length).toBeGreaterThanOrEqual(1);

  // Every emitted expose chunk file must appear in the stats assets.
  // This verifies the fix: without it, split chunks named
  // "__federation_expose_expose_a-<hash>" would be missed by the direct
  // Map lookup in StatsManager._getModuleAssets.
  expect(syncFiles.sort()).toEqual(
    expect.arrayContaining(emittedExposeFiles.sort()),
  );
});

it('should have multiple sync JS files when splitting actually occurred', () => {
  const syncFiles = stats.exposes[0].assets.js.sync;
  const exposeChunkPrefix = '__federation_expose_expose_a';
  const splitChunkFiles = syncFiles.filter((f) =>
    f.startsWith(exposeChunkPrefix),
  );

  // With minSize:0 and maxSize:100 and two modules each >100 bytes,
  // webpack must have produced more than one expose-related chunk.
  expect(splitChunkFiles.length).toBeGreaterThan(1);
});
