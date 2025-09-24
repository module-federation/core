it('prefers ModuleFederation shared provider over local alias fallback', async () => {
  // The aliased bare imports should resolve to the shared module id for the targets
  const reactId = require.resolve('react');
  const reactTargetId = require.resolve('next/dist/compiled/react');
  expect(reactId).toMatch(/webpack\/sharing/);
  expect(reactTargetId).toMatch(/webpack\/sharing/);

  const domClientId = require.resolve('react-dom/client');
  const domClientTargetId = require.resolve(
    'next/dist/compiled/react-dom/client',
  );
  expect(domClientId).toMatch(/webpack\/sharing/);
  expect(domClientTargetId).toMatch(/webpack\/sharing/);

  // The provided shares override the local compiled alias targets
  const React = await import('react');
  const ReactDomClient = await import('react-dom/client');
  expect(React.marker).toBe('provided-react');
  expect(ReactDomClient.marker).toBe('provided-react-dom-client');
});

module.exports = {
  testName: 'consume-with-aliases-generic-provider',
};
