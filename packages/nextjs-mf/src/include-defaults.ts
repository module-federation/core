// this is needed to ensure webpack does not attempt to tree shake unused modules. Since these should always come from host
require('react');
require('react-dom');
require('next/link');
require('next/link?shared');
require('next/link?client');
require('next/router');
require('next/head');
require('next/script');
require('next/dynamic');
require('styled-jsx');
require('next/navigation');
require('next/navigation?client')
require('next/navigation?shared')


if (process.env['NODE_ENV'] === 'development') {
  require('react/jsx-dev-runtime');
}

module.exports = {};
