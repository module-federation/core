# node

Software streaming to enable node.js support for browser-like chunk loading

```js
const StreamingRuntime = require('../node/streaming');
const NodeFederation = require('../node/streaming/NodeRuntime');

plugins: [
  new StreamingRuntime({
    name: 'website2',
    library: { type: 'commonjs' },
    filename: 'remoteEntry.js',
    exposes: {
      './SharedComponent': './remoteServer/SharedComponent',
    },
  }),
  new NodeFederation({
    name: 'website2',
    library: { type: 'commonjs' },
    filename: 'remoteEntry.js',
    exposes: {
      './SharedComponent': './remoteServer/SharedComponent',
    },
  }),
];
```
