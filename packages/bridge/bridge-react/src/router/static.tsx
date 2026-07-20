import React from 'react';

function parsePath(value: string) {
  const url = new URL(value, 'http://bridge.invalid');
  return {
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    state: null,
    key: 'default',
  };
}

const navigator = {
  createHref: (value: any) =>
    typeof value === 'string'
      ? value
      : `${value.pathname || '/'}${value.search || ''}${value.hash || ''}`,
  encodeLocation: (value: any) =>
    typeof value === 'string' ? parsePath(value) : value,
  push: () => {
    throw new Error('Cannot navigate while server rendering a Bridge remote');
  },
  replace: () => {
    throw new Error('Cannot navigate while server rendering a Bridge remote');
  },
  go: () => undefined,
};

export function BridgeStaticRouter({
  Router,
  basename,
  location,
  children,
}: {
  Router: React.ComponentType<any>;
  basename?: string;
  location: string;
  children?: React.ReactNode;
}) {
  return (
    <Router
      basename={basename}
      location={parsePath(location)}
      navigationType="POP"
      navigator={navigator}
      static
    >
      {children}
    </Router>
  );
}
