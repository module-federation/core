it('React share version to exist', async () => {
  const React = (await import('./app.js')).default;
  expect(React.version).toBe('1.0.0');
});

it('Module Graph should have layerd share', async () => {
  const React = (await import('./app.js')).default;
  expect(React.version).toBe('1.0.0');
  expect(
    __webpack_modules__['(react-layer)/./node_modules/react/index.js'],
  ).toBeTruthy();
});

it('Module Graph should unlayered share', async () => {
  const React = (await import('./app.js')).default;
  expect(React.version).toBe('1.0.0');
  expect(__webpack_modules__['./node_modules/react/index.js']).toBeTruthy();
});
