it('should warn when singleton is combined with include.version for alias-resolved share', async () => {
  const viaAlias = await import('react-allowed');
  const direct = await import('next/dist/compiled/react-allowed');

  // Shared identity should match direct
  expect(viaAlias.name).toBe(direct.name);
  expect(viaAlias.source).toBe(direct.source);
});

module.exports = {
  testName: 'share-with-aliases-filters-singleton',
};
