const fs = __non_webpack_require__('fs');
const path = __non_webpack_require__('path');

it('executes exposed layers, shorthand arrays, and module-rule overrides', async () => {
  const container = __non_webpack_require__('./container.js');
  await container.init({});
  const expected = {
    './Server': TEST_RULE ?? TEST_SERVER,
    './Client': TEST_RULE ?? 'client',
    './Inherited': TEST_RULE,
    './String': TEST_RULE,
    './List': TEST_RULE,
    ...(TEST_ARRAY ? { './source.js': TEST_RULE } : {}),
  };
  const instances = new Set();
  for (const [name, layer] of Object.entries(expected)) {
    const value = (await container.get(name))().default;
    expect(value).toEqual({ layer });
    if (['./Server', './Client', './Inherited'].includes(name))
      instances.add(value);
  }
  expect(instances.size).toBe(TEST_RULE ? 1 : 3);
  expect(globalThis.exposeSideEffect).toBe(true);
  delete globalThis.exposeSideEffect;

  for (const filename of ['mf-manifest.json', 'mf-stats.json']) {
    const file = path.join(__dirname, filename);
    if (!TEST_MANIFEST) {
      expect(fs.existsSync(file)).toBe(false);
      continue;
    }
    const artifact = JSON.parse(fs.readFileSync(file, 'utf8'));
    expect(artifact.exposes).toHaveLength(Object.keys(expected).length);
    expect(artifact.exposes.find((item) => item.name === 'Server').layer).toBe(
      TEST_SERVER,
    );
    expect(
      artifact.exposes.find((item) => item.name === 'Inherited'),
    ).not.toHaveProperty('layer');
  }
});
