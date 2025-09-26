it('unifies React/DOM/JSX via pages-dir aliases with full federation', () => {
  // Important: use a dynamic import to create an async boundary so
  // federation runtime initializes before we touch shared consumes.
  return import('./suite').then(({ run }) => run());
});

module.exports = {
  testName: 'next-pages-layer-unify',
};
