/**
 * Pre-compiled version of SimpleMFDemo for Module Federation
 * Uses React.createElement to avoid Lynx JSX transformation issues
 */
import { useState } from '@lynx-js/react';
import * as React from 'react';

export function SimpleMFDemo() {
  const [status] = useState('Plugin Active');

  return React.createElement(
    'view',
    {
      style: { padding: '20px' },
    },
    [
      React.createElement(
        'text',
        {
          key: 'title',
          style: { fontSize: '18px', fontWeight: 'bold', color: '#00b894' },
        },
        '🚀 Module Federation + Rspeedy',
      ),

      React.createElement(
        'view',
        {
          key: 'status',
          style: { marginTop: '10px' },
        },
        React.createElement(
          'text',
          {
            style: { fontSize: '14px' },
          },
          `Status: ${status}`,
        ),
      ),

      React.createElement(
        'view',
        {
          key: 'info1',
          style: { marginTop: '10px' },
        },
        React.createElement(
          'text',
          {
            style: { fontSize: '12px', color: '#666' },
          },
          'This app is configured with @module-federation/rspeedy-core-plugin',
        ),
      ),

      React.createElement(
        'view',
        {
          key: 'info2',
          style: { marginTop: '15px' },
        },
        React.createElement(
          'text',
          {
            style: { fontSize: '12px', color: '#666' },
          },
          "The plugin bridges Module Federation with Lynx's nativeApp.loadScript()",
        ),
      ),
    ],
  );
}

export default SimpleMFDemo;
