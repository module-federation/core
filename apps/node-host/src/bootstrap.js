/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';

const remoteMsg = import('node_remote/test').then((m) => {
  console.log('\x1b[32m%s\x1b[0m', m.default || m);
  return m.default || m;
});

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', async (req, res) => {
  const localRemoteMsg = import('node_local_remote/test').then((m) => {
    console.log('\x1b[32m%s\x1b[0m', m.default || m);
    return m.default || m;
  });

  res.send({
    message: 'Welcome to node-host!',
    remotes: {
      node_remote: await remoteMsg,
      node_local_remote: await localRemoteMsg,
    },
  });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
