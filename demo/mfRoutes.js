module.exports = {
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
