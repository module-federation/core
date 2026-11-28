import { createInstance } from '../../../../../runtime/dist/compose.js';
import { shared } from '../../../../../runtime-core/dist/shared/capability.js';

const fs = __non_webpack_require__('fs');
const path = __non_webpack_require__('path');

it('retains and selects both same-version singletons in scalar scopes', async () => {
  const { a, b } = await import('./bootstrap.js');
  expect(a).toEqual({ scope: 'a' });
  expect(b).toEqual({ scope: 'b' });
  expect(a).not.toBe(b);

  // A consumer without local fallbacks verifies that both providers registered.
  const consumer = createInstance(
    {
      name: `scalar_scopes_${TEST_PREFIX}consumer`,
      remotes: [],
    },
    { shared },
  );
  const registered = [];
  for (const scope of ['a', 'default']) {
    consumer.initShareScopeMap(scope, __webpack_share_scopes__[scope]);
    const factory = await consumer.loadShare('react', {
      customShareInfo: {
        scope: [scope],
        shareConfig: { layer: TEST_LAYER, requiredVersion: false },
      },
    });
    registered.push(factory?.().default);
  }
  const artifacts = ['mf-stats.json', 'mf.json'].map((filename) => {
    const artifact = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, `${TEST_PREFIX}${filename}`),
        'utf8',
      ),
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
      }))
      .sort((first, second) =>
        String(first.scope).localeCompare(String(second.scope)),
      );
  });
  const expectedRows = [
    {
      scope: 'a',
      layer: TEST_LAYER,
      version: '1.0.0',
      singleton: true,
      requiredVersion: false,
      assets: [
        expect.stringMatching(new RegExp(`^${TEST_PREFIX}.*a_js\\.js$`)),
      ],
    },
    {
      scope: 'default',
      layer: TEST_LAYER,
      version: '1.0.0',
      singleton: true,
      requiredVersion: '1.0.0',
      assets: [
        expect.stringMatching(new RegExp(`^${TEST_PREFIX}.*b_js\\.js$`)),
      ],
    },
  ];
  expect(artifacts[0]).toEqual(artifacts[1]);
  for (const row of artifacts[0]) {
    for (const filename of row.assets) {
      expect(fs.existsSync(path.join(__dirname, filename))).toBe(true);
    }
  }
  expect({ registered, stats: artifacts[0], manifest: artifacts[1] }).toEqual({
    registered: [a, b],
    stats: expectedRows,
    manifest: expectedRows,
  });
  expect(registered[0]).toBe(a);
  expect(registered[1]).toBe(b);
});
