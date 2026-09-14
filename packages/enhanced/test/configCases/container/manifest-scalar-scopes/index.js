const fs = __non_webpack_require__('fs');
const path = __non_webpack_require__('path');

it('retains and selects both same-version singletons in scalar scopes', async () => {
  const { a, b } = await import('./bootstrap.js');
  expect(a).toEqual({ scope: 'a' });
  expect(b).toEqual({ scope: 'b' });
  expect(a).not.toBe(b);

  // Imports can succeed through local fallbacks even if registration loses a scope.
  const registered = [];
  for (const scope of ['a', 'b']) {
    const entry = __webpack_share_scopes__[scope]?.react?.['1.0.0'];
    const factory = entry && (await entry.get());
    registered.push(factory?.().default);
  }
  const artifacts = ['mf-stats.json', 'mf-manifest.json'].map((filename) => {
    const artifact = JSON.parse(
      fs.readFileSync(path.join(__dirname, filename), 'utf8'),
    );
    return artifact.shared
      .filter((item) => item.name === 'react')
      .map((item) => ({
        scope: item.shareScope,
        layer: item.layer,
        version: item.version,
        singleton: item.singleton,
        requiredVersion: item.requiredVersion,
        assets: item.assets.js.sync,
      }));
  });
  for (const filename of ['a_js.js', 'b_js.js']) {
    expect(fs.existsSync(path.join(__dirname, filename))).toBe(true);
  }
  const expectedRows = [
    {
      scope: 'a',
      layer: undefined,
      version: '1.0.0',
      singleton: true,
      requiredVersion: false,
      assets: ['a_js.js'],
    },
    {
      scope: 'b',
      layer: undefined,
      version: '1.0.0',
      singleton: true,
      requiredVersion: '1.0.0',
      assets: ['b_js.js'],
    },
  ];
  expect({ registered, stats: artifacts[0], manifest: artifacts[1] }).toEqual({
    registered: [a, b],
    stats: expectedRows,
    manifest: expectedRows,
  });
  expect(registered[0]).toBe(a);
  expect(registered[1]).toBe(b);
});
