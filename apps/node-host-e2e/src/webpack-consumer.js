import process from 'node:process';
import nodeLocalRemote from 'node_local_remote/test';

import('node_remote/test').then(({ default: nodeRemote }) => {
  process.stdout.write(
    JSON.stringify({
      nodeLocalRemote,
      nodeRemote,
    }),
  );
});
