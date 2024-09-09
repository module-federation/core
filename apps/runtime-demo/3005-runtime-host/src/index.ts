import {
  init,
  registerGlobalPlugins,
} from '@module-federation/enhanced/runtime';
import customPlugin from './runtimePlugin';

registerGlobalPlugins([customPlugin()]);

require('./bootstrap');
