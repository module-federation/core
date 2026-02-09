import React from 'react';
import App from 'next/app';
import { Layout, version, ConfigProvider } from 'antd';
import { useRouter } from 'next/compat/router';
import { StyleProvider } from '@ant-design/cssinjs';

import HostAppMenu from '../components/menu';

import SharedNav from '../components/SharedNav';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const resolvedPath = router?.asPath || router?.pathname || '/';
  const MenuComponent = HostAppMenu;

  return (
    <StyleProvider layer>
      <ConfigProvider theme={{ hashed: false }}>
        <Layout style={{ minHeight: '100vh' }}>
          <SharedNav currentPath={resolvedPath} />
          <Layout>
            <Layout.Sider width={200}>
              <MenuComponent currentPath={resolvedPath} />
            </Layout.Sider>
            <Layout>
              <Layout.Content style={{ background: '#fff', padding: 20 }}>
                <Component {...pageProps} />
              </Layout.Content>
              <Layout.Footer
                style={{
                  background: '#fff',
                  color: '#999',
                  textAlign: 'center',
                }}
              >
                antd@{version}
              </Layout.Footer>
            </Layout>
          </Layout>
        </Layout>
      </ConfigProvider>
    </StyleProvider>
  );
}

MyApp.getInitialProps = async (ctx) => {
  return App.getInitialProps(ctx);
};

export default MyApp;
