'use strict';

const path = require('path');
const { runBuild } = require('../../scripts/shared/build');

const clientConfig = require('./client.build');
const serverConfig = require('./server.build');
const ssrConfig = require('./ssr.build');

runBuild({
  clientConfig,
  serverConfig,
  ssrConfig,
  buildDir: path.resolve(__dirname, '../build'),
});
