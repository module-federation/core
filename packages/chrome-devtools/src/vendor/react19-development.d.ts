export function getReact19Development(): {
  React: typeof import('react');
  ReactDOM: typeof import('react-dom') & typeof import('react-dom/client');
};
