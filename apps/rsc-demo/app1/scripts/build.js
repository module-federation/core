'use strict';

const path = require('path');
const { runBuild } = require('../../scripts/shared/build');

const clientConfig = require('./client.build');
const serverConfig = require('./server.build');

runBuild({
  clientConfig,
  serverConfig,
  buildDir: path.resolve(__dirname, '../build'),
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
