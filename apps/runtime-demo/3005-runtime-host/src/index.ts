import { init } from '@module-federation/enhanced/runtime';
import customPlugin from './runtimePlugin';

init({
  name: 'runtime_host',
  remotes: [],
  globalPlugins: [customPlugin()],
});

require('./bootstrap');
