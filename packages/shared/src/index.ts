export const mfRoutes = {
  'home@http://localhost:4200/_next/static/chunks/remoteEntry.js': [
    '/',
    '/home',
  ],
  'shop@http://localhost:4201/_next/static/chunks/remoteEntry.js': [
    '/shop',
    '/shop/products/[...slug]',
  ],
  'checkout@http://localhost:4202/_next/static/chunks/remoteEntry.js': [
    '/checkout',
    '/checkout/exposed-pages',
  ],
  'unresolvedHost@http://localhost:3333/_next/static/chunks/remoteEntry.js': [
    '/unresolved-host',
  ],
  'wrongEntry@http://localhost:4200/_next/static/chunks/remoteEntryWrong.js': [
    '/wrong-entry',
  ],
};
