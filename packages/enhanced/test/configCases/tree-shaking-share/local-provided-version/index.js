const fs = __non_webpack_require__('fs');
const path = __non_webpack_require__('path');

__webpack_require__.p = 'PUBLIC_PATH';

it('should preserve configured version for local provided shared fallback', () => {
  const fallbackPath = path.join(
    __dirname,
    'independent-packages',
    'local_provided',
    '2.3.4',
    'share-entry.js',
  );

  expect(fs.existsSync(fallbackPath)).toBe(true);
  expect(fs.readFileSync(fallbackPath, 'utf-8')).toContain(
    'local-provided-value',
  );

  const fallbackVersions = __webpack_require__.federation.sharedFallback[
    'local-provided'
  ].map((item) => item[1]);

  expect(fallbackVersions).toEqual(['2.3.4']);
});
