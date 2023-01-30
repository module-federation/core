'use strict';

const camelCase = (name) =>
  name.replace(/[-]./g, (m) => m.substr(1).toUpperCase());

module.exports = require('require-directory')(module, __dirname, {
  recurse: false,
  rename: camelCase,
});
