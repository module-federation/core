import React from 'react';
import { Outlet, useNavigate } from '@modern-js/runtime/router';
import { lazyLoadComponentPlugin } from '@module-federation/modern-js-v3/react';
import { getInstance } from '@module-federation/modern-js-v3/runtime';

getInstance()!.registerPlugins([lazyLoadComponentPlugin()]);
const App: React.FC = () => {
  const navi = useNavigate();

  const navs = [
    'home',
    'all',
    'remote',
    'nested-remote',
    'dynamic-remote',
    'dynamic-nested-remote',
  ];

  return (
    <div>
      <header
        style={{
          alignItems: 'center',
          background: '#172033',
          display: 'flex',
          gap: 8,
          minHeight: 48,
          padding: '0 24px',
        }}
      >
        {navs.map((key) => (
          <button
            key={key}
            onClick={() => navi(key === 'home' ? '/' : `/${key}`)}
            style={{
              background: 'transparent',
              border: 0,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 14,
              padding: '8px 10px',
            }}
            type="button"
          >
            {key}
          </button>
        ))}
      </header>
      <main style={{ padding: '0 48px' }}>
        <div
          style={{
            minHeight: 280,
            padding: 24,
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default App;
