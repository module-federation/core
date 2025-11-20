import '@lynx-js/preact-devtools';
import '@lynx-js/react/debug';
import { root } from '@lynx-js/react';
/**
 * Module Federation setup for Lynx/rspeedy
 */
import { createInstance } from '@module-federation/enhanced/runtime';
import RspeedyCorePlugin from '@module-federation/rspeedy-core-plugin';

// Initialize Module Federation with the rspeedy runtime plugin
createInstance({
  name: 'lynx_host',
  remotes: [
    // Add your remote applications here
    // {
    //   name: 'remote-app',
    //   entry: 'http://localhost:3001/mf-manifest.json',
    // },
  ],
  plugins: [
    // Use the rspeedy core plugin to bridge with Lynx's native script loading
    RspeedyCorePlugin(),
  ],
});

import { App } from './App.jsx';

root.render(<App />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
