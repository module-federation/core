const fs = __non_webpack_require__('fs');
const path = __non_webpack_require__('path');

__webpack_require__.p = 'PUBLIC_PATH';
it('should treeshake ui-lib correctly', async () => {
  const app = await import('./App.js');
  expect(app.default()).toEqual(
    'Uilib has 2 exports, and Button value is Button',
  );

  const bundlePath = path.join(__dirname, 'node_modules_ui-lib_index_js.js');
  const bundleContent = fs.readFileSync(bundlePath, 'utf-8');
  expect(bundleContent).toContain('Button');
  expect(bundleContent).toContain('Badge');
  expect(bundleContent).not.toContain('List');
});

it('should treeshake ui-lib-dynamic-specific-export correctly', async () => {
  const { List } = await import('ui-lib-dynamic-specific-export');
  expect(List).toEqual('List');

  const bundlePath = path.join(
    __dirname,
    'node_modules_ui-lib-dynamic-specific-export_index_js.js',
  );
  const bundleContent = fs.readFileSync(bundlePath, 'utf-8');
  expect(bundleContent).toContain('List');
  expect(bundleContent).not.toContain('Button');
  expect(bundleContent).not.toContain('Badge');
});

it('should not treeshake ui-lib-dynamic-default-export', async () => {
  const uiLib = await import('ui-lib-dynamic-default-export');
  expect(uiLib.List).toEqual('List');

  const bundlePath = path.join(
    __dirname,
    'node_modules_ui-lib-dynamic-default-export_index_js.js',
  );
  const bundleContent = fs.readFileSync(bundlePath, 'utf-8');
  expect(bundleContent).toContain('List');
  expect(bundleContent).toContain('Button');
  expect(bundleContent).toContain('Badge');
});

it('should not treeshake ui-lib-side-effect if not set sideEffect:false ', async () => {
  const uiLibSideEffect = await import('ui-lib-side-effect');
  expect(uiLibSideEffect.List).toEqual('List');

  const bundlePath = path.join(
    __dirname,
    'node_modules_ui-lib-side-effect_index_js.js',
  );
  const bundleContent = fs.readFileSync(bundlePath, 'utf-8');
  expect(bundleContent).toContain('List');
  expect(bundleContent).toContain('Button');
  expect(bundleContent).toContain('Badge');
});

it('should inject usedExports into entry chunk by default', async () => {
  expect(
    __webpack_require__.federation.usedExports['ui-lib']['main'].sort(),
  ).toEqual(['Badge', 'Button']);
});

it('should inject usedExports into manifest and stats if enable manifest', async () => {
  const { Button } = await import('ui-lib');
  expect(Button).toEqual('Button');

  const manifestPath = path.join(__dirname, 'mf-manifest.json');
  const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  expect(
    JSON.stringify(
      manifestContent.shared
        .find((s) => s.name === 'ui-lib')
        .usedExports.sort(),
    ),
  ).toEqual(JSON.stringify(['Badge', 'Button']));

  const statsPath = path.join(__dirname, 'mf-stats.json');
  const statsContent = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
  expect(
    JSON.stringify(
      statsContent.shared.find((s) => s.name === 'ui-lib').usedExports.sort(),
    ),
  ).toEqual(JSON.stringify(['Badge', 'Button']));
});
