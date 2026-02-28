'use strict';

const entry = require('./dist/src/index.js');
const NextFederationPlugin =
  entry?.default || entry?.NextFederationPlugin || entry;

module.exports = NextFederationPlugin;
module.exports.default = NextFederationPlugin;
module.exports.NextFederationPlugin = NextFederationPlugin;
