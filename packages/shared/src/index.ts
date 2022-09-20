export const mfRoutes = {
  'home_app@http://localhost:3000/_next/static/chunks/remoteEntry.js': [
    '/',
    '/home',
  ],
  'shop@http://localhost:3001/_next/static/chunks/remoteEntry.js': [
    '/shop',
    '/shop/products/[...slug]',
  ],
  'checkout@http://localhost:3002/_next/static/chunks/remoteEntry.js': [
    '/checkout',
    '/checkout/exposed-pages',
  ],
  'unresolvedHost@http://localhost:3333/_next/static/chunks/remoteEntry.js': [
    '/unresolved-host',
  ],
  'wrongEntry@http://localhost:3000/_next/static/chunks/remoteEntryWrong.js': [
    '/wrong-entry',
  ],
};

export const getRemotes = (isServer: boolean) => {
  return {
    home: `home_app@http://localhost:3000/_next/static/${
      isServer ? 'ssr' : 'chunks'
    }/remoteEntry.js`,
    shop: `shop@http://localhost:3001/_next/static/${
      isServer ? 'ssr' : 'chunks'
    }/remoteEntry.js`,
    checkout: `checkout@http://localhost:3002/_next/static/${
      isServer ? 'ssr' : 'chunks'
    }/remoteEntry.js`,
  };
};
