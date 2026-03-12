import React from 'react';
import { Outlet, useNavigate, useLocation } from '@modern-js/runtime/router';
import { Layout, Menu } from 'antd';
import { getInstance } from '@module-federation/modern-js-v3/runtime';
import { lazyLoadComponentPlugin } from '@module-federation/modern-js-v3/react';

getInstance()!.registerPlugins([lazyLoadComponentPlugin()]);
console.log('layout');
getInstance()!.prefetch({
  id: 'remote/BasicComponent',
});

getInstance()!.prefetch({
  id: 'provider-csr',
});

const { Header, Content } = Layout;

const App: React.FC = () => {
  const navi = useNavigate();

  const Navs = [
    'home',
    'basic',
    'csr',
    'server-downgrade',
    'client-downgrade',
  ].map((i) => ({
    key: i,
    label: i,
    icon: <span className={i}></span>,
    onClick: ({ key }: { key: string }) => {
      console.log('key', key);
      if (key === 'home') {
        navi(`/`);
      } else {
        navi(`/${key}`);
      }
    },
  }));
  const location = useLocation();
  const nav = location.pathname.slice(1);
  const defaultSelectedKeys = [nav === '' ? 'home' : nav];
  return (
    <Layout>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={defaultSelectedKeys}
          items={Navs}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content style={{ padding: '0 48px' }}>
        <div
          style={{
            minHeight: 280,
            padding: 24,
          }}
        >
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default App;
