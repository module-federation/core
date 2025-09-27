export async function run() {
  // Require ids unify to the shared targets
  const reactId = require.resolve('react');
  const reactTargetId = require.resolve('next/dist/compiled/react');
  expect(reactId).toBe(reactTargetId);
  expect(reactId).toMatch(/webpack\/sharing/);

  const domId = require.resolve('react-dom');
  const domTargetId = require.resolve('next/dist/compiled/react-dom');
  expect(domId).toBe(domTargetId);
  expect(domId).toMatch(/webpack\/sharing/);

  const jsxId = require.resolve('react/jsx-runtime');
  const jsxTargetId = require.resolve('next/dist/compiled/react/jsx-runtime');
  expect(jsxId).toBe(jsxTargetId);

  // Imports resolve to compiled Next stubs and are identical via alias or direct
  const React = await import('react');
  const ReactDirect = await import('next/dist/compiled/react');
  expect(React.id).toBe('compiled-react');
  expect(React).toEqual(ReactDirect);

  const ReactDOM = await import('react-dom');
  const ReactDOMDirect = await import('next/dist/compiled/react-dom');
  expect(ReactDOM.id).toBe('compiled-react-dom');
  expect(ReactDOM).toEqual(ReactDOMDirect);

  const jsx = await import('react/jsx-runtime');
  const jsxDirect = await import('next/dist/compiled/react/jsx-runtime');
  expect(jsx.jsx).toBe('compiled-jsx');
  expect(jsx).toEqual(jsxDirect);
}
