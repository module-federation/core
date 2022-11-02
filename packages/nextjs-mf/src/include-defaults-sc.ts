// this is needed to ensure webpack does not attempt to tree shake unused modules. Since these should always come from host
require('react');
require('react-dom');
require('next/link?shared');
require('next/head?shared');
require('next/script?shared');
require('next/dist/client/components/layout-router?shared')
require('next/dist/client/components/app-router?shared')
require('next/dist/client/components/render-from-template-context?shared')
require('next/dist/client/components/request-async-storage?shared')
require('next/dist/client/components/static-generation-async-storage?shared')
require('next/dist/compiled/react-server-dom-webpack/server.browser?shared')
try {
  require('next/dist/compiled/react/react.shared-subset?shared');
} catch (e) {}
//require('next/dynamic?shared');
if(typeof window === 'undefined') {
  require('next/dist/client/components/navigation?shared');
  require('next/dist/client/components/hooks-server-context');
}
//@ts-ignore
if (process.env.NODE_ENV === 'development') {
  require('react/jsx-dev-runtime');
}

module.exports = {};
