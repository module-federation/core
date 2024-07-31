import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import nodeRuntimePlugin from '@module-federation/node/runtimePlugin';

// TODO: Support pass params in runtimePlugins , supports pass different params via env.
const isContainer =
  typeof __filename === 'string'
    ? __filename.includes('remote')
      ? true
      : false
    : false;
const pluginName = `node-plugin-${isContainer}`;

const nodePlugin: () => FederationRuntimePlugin = () => ({
  name: pluginName,
  beforeInit: nodeRuntimePlugin().beforeInit,
});

export default nodePlugin;
