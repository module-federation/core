import { createInstance } from '@module-federation/runtime';
import nodeRuntimePlugin from '@module-federation/node/runtimePlugin';

const mf = createInstance({
  name: 'node_esm_host',
  remotes: [
    {
      name: 'node_esm_remote',
      entry: 'http://localhost:3030/remoteEntry.mjs',
      // 'module' marks the entry as a native ES module; the node runtime
      // plugin's loadEntry bridge imports it with a native dynamic import()
      // through the loader hooks registered by
      // `node --import @module-federation/node/register` — which also
      // allowlists this remote's origin automatically.
      type: 'module',
    },
  ],
  plugins: [nodeRuntimePlugin()],
});

const { greeting } = await mf.loadRemote('node_esm_remote/greeting');
const message = await greeting('node-esm-host');

console.log('[node-esm-host] loadRemote result:', message);

if (!message.includes('42')) {
  throw new Error('Expected the async-chunk answer (42) in the message');
}
console.log(
  '[node-esm-host] SUCCESS: remote entry + async chunk loaded via native ESM import() over http',
);
