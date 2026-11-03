it('should init containers that reference each other from two concurrent chains', async () => {
  const containerA = __non_webpack_require__('./containerA.js');
  const containerB = __non_webpack_require__('./containerB.js');
  const shareScope = {};

  // Two independent init chains, as a host does when it loads both remotes
  const inits = Promise.all([
    containerA.init(shareScope, []),
    containerB.init(shareScope, []),
  ]);

  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve('timeout'), 2000);
  });
  const result = await Promise.race([inits.then(() => 'resolved'), timeout]);
  clearTimeout(timer);
  expect(result).toBe('resolved');
});
