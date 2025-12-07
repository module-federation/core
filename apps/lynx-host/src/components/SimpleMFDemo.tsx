/**
 * Module Federation demo - testing host configuration first
 */
import { useState } from '@lynx-js/react';
import {
  createInstance,
  loadRemote,
} from '@module-federation/enhanced/runtime';
import RspeedyCorePlugin from '@module-federation/rspeedy-core-plugin';

export function SimpleMFDemo() {
  const [status] = useState('Host App Ready');
  // Initialize Module Federation with the rspeedy runtime plugin
  createInstance({
    name: 'lynx_host',
    remotes: [
      // Add your remote applications here
      {
        name: 'remote-app',
        entry: 'http://localhost:3001/mf-manifest.json',
      },
    ],
    plugins: [
      // Use the rspeedy core plugin to bridge with Lynx's native script loading
      RspeedyCorePlugin(),
    ],
  });
  const component = loadRemote('remote-app/SimpleMFDemo');
  return (
    <view style={{ padding: '20px' }}>
      <text style={{ fontSize: '18px', fontWeight: 'bold', color: '#00b894' }}>
        🏠 Module Federation Host + Rspeedy
      </text>

      <view style={{ marginTop: '10px' }}>
        <text style={{ fontSize: '14px' }}>Status: {status}</text>
      </view>

      <view style={{ marginTop: '10px' }}>
        <text style={{ fontSize: '12px', color: '#666' }}>
          Host app is configured for Module Federation
        </text>
      </view>

      <view style={{ marginTop: '15px' }}>
        <text style={{ fontSize: '12px', color: '#666' }}>
          Ready to load remote components from lynx_remote
        </text>
      </view>
    </view>
  );
}
