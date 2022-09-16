require('react');
require('react-dom');
require('next/link');
require('next/router');
require('next/head');
require('next/script');
require('next/dynamic');
require('styled-jsx');

if (process.env['NODE_ENV'] === 'development') {
  require('react/jsx-dev-runtime');
}

export {};
