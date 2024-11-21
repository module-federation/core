it('Module Graph should have layerd share', async () => {
  const React = (await import('./otherApp.js')).default;
  expect(React.version).toBe('1.0.0');
  // expect(__webpack_modules__['(react-layer)/./node_modules/react/index.js']).toBeTruthy();
});
