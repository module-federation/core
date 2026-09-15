const fs = __non_webpack_require__('fs');
const path = __non_webpack_require__('path');

it('resolves layered relative consumes from their issuer directory', async () => {
  expect((await import('./nested/consumer')).default).toBe(
    'issuer-relative-shared',
  );
  const stats = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'mf-stats.json'), 'utf8'),
  );
  expect(stats.exposes).toContainEqual(
    expect.objectContaining({ name: 'consumer', layer: 'server' }),
  );
  const compilation = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'stats.json'), 'utf8'),
  );
  expect(compilation.modules).toContainEqual(
    expect.objectContaining({
      moduleType: 'consume-shared-module',
      layer: 'server',
    }),
  );
});
