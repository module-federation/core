/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import node_local_remote from 'node_local_remote/test';
import { registerRemotes, loadRemote } from '@module-federation/runtime';

registerRemotes([
  {
    name: 'node_dynamic_remote',
    entry: 'http://localhost:3026/remoteEntry.js',
  },
]);

const getMemoryUsage = () => {
  const formatSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  const memory = process.memoryUsage();
  return `Time: ${new Date()}\nheap total: ${formatSize(
    memory.heapTotal,
  )} heapUsed: ${formatSize(memory.heapUsed)} rss: ${formatSize(memory.rss)}`;
};

const remoteMsg = import('node_remote/test').then((m) => {
  console.log('\x1b[32m%s\x1b[0m', m.default || m);
  return m.default || m;
});
console.log('\x1b[32m%s\x1b[0m', node_local_remote);

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', async (req, res) => {
  res.send({
    message: 'Welcome to node-host!',
    remotes: {
      node_remote: await remoteMsg,
      node_local_remote,
    },
  });
});

app.get('/dynamic-remote', async (req, res) => {
  const dynamicRemote = await loadRemote('node_dynamic_remote/test-with-axios');

  res.send({
    message: 'dynamic remote',
    dynamicRemote: dynamicRemote(),
  });
});

app.get('/upgrade-remote', async (req, res) => {
  registerRemotes(
    [
      {
        name: 'node_dynamic_remote',
        entry: 'http://localhost:3027/remoteEntry.js',
      },
    ],
    { force: true },
  );

  res.send({
    message: 'Upgrade success!',
  });
});

app.get('/memory-cache', async (req, res) => {
  const memoryUsage = getMemoryUsage();
  console.log(memoryUsage);
  res.send({
    message: 'memory-cache',
    memoryUsage: memoryUsage,
  });
});

app.get('/federation-info', async (req, res) => {
  console.log(global.__FEDERATION__);
  console.log(global.__FEDERATION__.__INSTANCES__[0].moduleCache);
  res.send({
    message: 'federation info will be output in terminal !',
  });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
