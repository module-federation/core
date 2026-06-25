const dom = require('../node_modules/react-router/dist/development/dom-export.js');
const router = require('react-router');

module.exports = {
  ...dom,
  BrowserRouter: router.BrowserRouter,
  createBrowserRouter: router.createBrowserRouter,
};
