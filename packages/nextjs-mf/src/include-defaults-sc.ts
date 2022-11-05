// this is needed to ensure webpack does not attempt to tree shake unused modules. Since these should always come from host
// require('react?shared');
require('next/link?shared');
require('next/link');
require('next/navigation');
require('next/link?client');
require('next/head?shared');
require('next/script?shared');
require('next/dist/client/components/layout-router?shared')
require('next/dist/client/components/app-router?shared')
require('next/dist/client/components/render-from-template-context?shared')
require('next/dist/client/components/request-async-storage?shared')
require('next/dist/client/components/static-generation-async-storage?shared')
require('next/dist/compiled/react-server-dom-webpack/server.browser')
// require('next/dist/client/components/error-boundary?shared')
try {
  require('next/dist/compiled/react/react.shared-subset');
  require('next/dist/compiled/react/react.shared-subset?shared');
} catch (e) {}
//require('next/dynamic?shared');
require('next/navigation?client')
require('next/navigation?shared')
if(typeof window === 'undefined') {
  require('next/dist/client/components/hooks-server-context?shared');
}
//@ts-ignore
if (process.env.NODE_ENV === 'development') {
  require('react/jsx-dev-runtime');
}

module.exports = {};
