/**
 * Simple Module Federation demo for Lynx
 * Uses Lynx components that should be transformed by pluginReactLynx
 */
import { useState } from '@lynx-js/react';

const SimpleMFDemo = () => {
  const [status] = useState('Plugin Active');

  return (
    <view style={{ padding: '20px' }}>
      <text style={{ fontSize: '18px', fontWeight: 'bold', color: '#00b894' }}>
        🚀 Module Federation + Rspeedy
      </text>

      <view style={{ marginTop: '10px' }}>
        <text style={{ fontSize: '14px' }}>Status: {status}</text>
      </view>

      <view style={{ marginTop: '10px' }}>
        <text style={{ fontSize: '12px', color: '#666' }}>
          This app is configured with @module-federation/rspeedy-core-plugin
        </text>
      </view>

      <view style={{ marginTop: '15px' }}>
        <text style={{ fontSize: '12px', color: '#666' }}>
          The plugin bridges Module Federation with Lynx's
          nativeApp.loadScript()
        </text>
      </view>
    </view>
  );
};

export default SimpleMFDemo;
export { SimpleMFDemo };
