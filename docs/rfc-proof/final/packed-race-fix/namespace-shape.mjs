import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const shapes = [];
for (let emission = 1; emission <= 3; emission++)
  for (const entry of ['index', 'helpers', 'core']) {
    const before = require(join(root, 'before/dist', `${entry}.cjs`));
    const after = require(
      join(
        root,
        `emission-${emission}/consumer/node_modules/@module-federation/runtime/dist`,
        `${entry}.cjs`,
      ),
    );
    const keys = Object.keys(before).sort();
    assert.deepEqual(Object.keys(after).sort(), keys);
    for (const key of keys)
      assert.equal(typeof after[key], typeof before[key], `${entry}.${key}`);
    if (entry === 'core')
      for (const x of [before, after])
        assert.equal(x.default.ModuleFederation, x.ModuleFederation);
    if (entry === 'helpers')
      for (const x of [before, after])
        for (const key of ['global', 'share', 'utils'])
          assert.equal(x.default[key], x[key]);
    shapes.push({ emission, entry, keys });
  }
console.log(
  JSON.stringify({
    kind: 'passed',
    controls:
      'actual CJS before vs all three corrected emitted artifacts; named/default identities retained',
    shapes,
  }),
);
