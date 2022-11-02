// this is needed to ensure webpack does not attempt to tree shake unused modules. Since these should always come from host
require('react');
require('react-dom');
require('next/link?shared');
require('next/head?shared');
require('next/script?shared');
require('next/dynamic?shared');
require('next/navigation?shared');
// require('next/dist/shared/lib/app-router-context');

//@ts-ignore
if (process.env.NODE_ENV === 'development') {
  require('react/jsx-dev-runtime');
}

module.exports = {};
