import React, { Suspense, lazy, useState } from 'react';
import App from 'next/app';
import { Layout, version, ConfigProvider } from 'antd';
import Router, { useRouter } from 'next/router';
import { StyleProvider } from '@ant-design/cssinjs';

import HostAppMenu from '../components/menu';

const SharedNav = lazy(() => import('home/SharedNav'));

function MyApp({ Component, pageProps }) {
  const { asPath } = useRouter();
  const [MenuComponent, setMenuComponent] = useState(() => HostAppMenu);
  const handleRouteChange = async (url) => {
    if (url.startsWith('/home') || url === '/') {
      // @ts-ignore
      const RemoteAppMenu = (await import('home/menu')).default;
      setMenuComponent(() => RemoteAppMenu);
    } else if (url.startsWith('/shop')) {
      // @ts-ignore
      const RemoteAppMenu = (await import('shop/menu')).default;
      setMenuComponent(() => RemoteAppMenu);
    } else {
      setMenuComponent(() => HostAppMenu);
    }
  };
  // handle first route hit.
  React.useEffect(() => {
    handleRouteChange(asPath);
  }, [asPath]);

  //handle route change
  React.useEffect(() => {
    // Step 3: Subscribe on events
    Router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      Router.events.off('routeChangeStart', handleRouteChange);
    };
  }, []);

  return (
    <StyleProvider layer>
      <ConfigProvider theme={{ hashed: false }}>
        <Layout style={{ minHeight: '100vh' }}>
          <SharedNav />
          <Layout>
            <Layout.Sider width={200}>
              <MenuComponent />
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
