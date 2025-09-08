/**
 * Basic usage example for @module-federation/rspeedy-core-plugin
 * 
 * This example shows how to set up Module Federation with rspeedy/Lynx
 */

import { createInstance, loadRemote } from '@module-federation/enhanced/runtime';
import RspeedyCorePlugin from '@module-federation/rspeedy-core-plugin';

// Initialize Module Federation with Lynx support
const mfInstance = createInstance({
  name: 'lynx-host',
  remotes: [
    {
      name: 'lynx-remote',
      entry: 'http://localhost:3001/remoteEntry.js',
    },
  ],
  plugins: [
    // Add the rspeedy core plugin
    RspeedyCorePlugin(),
  ],
});

// Load a remote module
async function loadRemoteComponent() {
  try {
    const RemoteComponent = await loadRemote<React.ComponentType>('lynx-remote/Component');
    
    if (RemoteComponent) {
      console.log('Successfully loaded remote component');
      return RemoteComponent;
    }
  } catch (error) {
    console.error('Failed to load remote component:', error);
  }
  
  return null;
}

export { loadRemoteComponent };