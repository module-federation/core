/**
 * Module Federation demo - testing host configuration first
 */
import { useState } from '@lynx-js/react';

export function SimpleMFDemo() {
  const [status] = useState('Host App Ready');

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
