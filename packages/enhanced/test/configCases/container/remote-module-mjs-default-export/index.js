it('should correctly handle default imports in .mjs files from remote modules', async () => {
  const { testDefaultImport } = await import('./pure-esm-consumer.mjs');
  const result = testDefaultImport();
  expect(result.defaultType).toBe('function');
  expect(result.defaultValue).toBe('remote default export');
  expect(result.namedExportValue).toBe('remote named export');
});
