/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
// import node_local_remote from 'node_local_remote/test';
console.log('loading test');

// console.log('\x1b[32m%s\x1b[0m', node_local_remote);

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', async (req, res) => {
  console.log('will send');
  res.send({
    message: 'Welcome to node-host!',
  });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
