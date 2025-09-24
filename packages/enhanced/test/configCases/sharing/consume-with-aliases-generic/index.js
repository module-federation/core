it('consumes aliased React and ReactDOM client via generic resolver mapping', async () => {
  const React = await import('react');
  const ReactDomClient = await import('react-dom/client');
  expect(React.marker).toBe('compiled-react');
  expect(ReactDomClient.marker).toBe('compiled-react-dom-client');
});

module.exports = {
  testName: 'consume-with-aliases-generic',
};
