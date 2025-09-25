it('prefers ModuleFederation shared provider over local alias fallback', async () => {
  // Aliased bare imports should surface the provided shared implementations
  const [React, ReactTarget] = await Promise.all([
    import('react'),
    import('next/dist/compiled/react'),
  ]);
  const [ReactDomClient, ReactDomClientTarget] = await Promise.all([
    import('react-dom/client'),
    import('next/dist/compiled/react-dom/client'),
  ]);

  // Provided shares override the local compiled alias targets regardless of import path
  expect(React.marker).toBe('provided-react');
  expect(ReactTarget.marker).toBe('provided-react');
  expect(ReactDomClient.marker).toBe('provided-react-dom-client');
  expect(ReactDomClientTarget.marker).toBe('provided-react-dom-client');
});

module.exports = {
  testName: 'consume-with-aliases-generic-provider',
};
