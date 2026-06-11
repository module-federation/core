const fs = __non_webpack_require__('fs');
const path = __non_webpack_require__('path');

__webpack_require__.p = 'PUBLIC_PATH';

it('should build shared fallback for every compiled nanoid version', async () => {
  const fallbackDir = path.join(__dirname, 'independent-packages', 'nanoid');
  const legacyFallbackPath = path.join(fallbackDir, '3.3.11', 'share-entry.js');
  const modernFallbackPath = path.join(fallbackDir, '5.1.6', 'share-entry.js');

  expect(fs.existsSync(legacyFallbackPath)).toBe(true);
  expect(fs.existsSync(modernFallbackPath)).toBe(true);
  expect(fs.readFileSync(legacyFallbackPath, 'utf-8')).toContain(
    'legacy-3.3.11',
  );
  expect(fs.readFileSync(modernFallbackPath, 'utf-8')).toContain(
    'modern-5.1.6',
  );

  const fallbackVersions =
    __webpack_require__.federation.sharedFallback.nanoid.map((item) => item[1]);

  expect(fallbackVersions.sort()).toEqual(['3.3.11', '5.1.6']);
});
