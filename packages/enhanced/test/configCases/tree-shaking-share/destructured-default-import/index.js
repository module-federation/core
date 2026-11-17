const fs = __non_webpack_require__('fs');
const path = __non_webpack_require__('path');

__webpack_require__.p = 'PUBLIC_PATH';

it('reads a destructured property of a shared default import', async () => {
  const app = await import('./App.js');
  expect(app.default()).toEqual('Button');
});

it('records destructured properties as used export names', () => {
  expect(__webpack_require__.federation.usedExports['ui-lib'].sort()).toEqual([
    'Button',
    'default',
  ]);
});

it('writes the destructured export names to the stats manifest', () => {
  const statsPath = path.join(__dirname, 'mf-stats.json');
  const statsContent = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
  expect(
    statsContent.shared.find((s) => s.name === 'ui-lib').usedExports.sort(),
  ).toEqual(['Button', 'default']);
});
