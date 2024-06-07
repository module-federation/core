import React from 'react';
import { Outlet, useNavigate } from '@modern-js/runtime/router';
import { LiveReload } from '@modern-js/runtime/mf';
import { Layout, Menu } from 'antd';

const { Header, Content } = Layout;

const App: React.FC = () => {
  const navi = useNavigate();

  const Navs = [
    'home',
    'all',
    'remote',
    'nested-remote',
    'dynamic-remote',
    'dynamic-nested-remote',
  ].map((i) => ({
    key: i,
    label: i,
    icon: <span className={i}></span>,
    onClick: ({ key }) => {
      if (key === 'home') {
        navi(`/`);
      } else {
        navi(`/${key}`);
      }
    },
  }));

  return (
    <Layout>
      <LiveReload />
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['home']}
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
