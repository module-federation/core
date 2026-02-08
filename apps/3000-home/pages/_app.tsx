import * as React from 'react';
import { useState } from 'react';
import { init } from '@module-federation/runtime';
console.log('logging init', typeof init);
import App from 'next/app';
import { Layout, version, ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import { useRouter } from 'next/compat/router';
import SharedNav from '../components/SharedNav';
import HostAppMenu from '../components/menu';
function MyApp(props) {
  const { Component, pageProps } = props;
  const router = useRouter();
  const [MenuComponent, setMenuComponent] = useState(() => HostAppMenu);
  const handleRouteChange = React.useCallback(async (url) => {
    if (url.startsWith('/shop')) {
      // @ts-ignore
      const RemoteAppMenu = (await import('shop/menu')).default;
      setMenuComponent(() => RemoteAppMenu);
      return;
    }

    if (url.startsWith('/checkout')) {
      // @ts-ignore
      const RemoteAppMenu = (await import('checkout/menu')).default;
      setMenuComponent(() => RemoteAppMenu);
      return;
    }

    setMenuComponent(() => HostAppMenu);
  }, []);

  // handle first route hit.
  React.useEffect(() => {
    const initialPath =
      router?.asPath ||
      (typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}${window.location.hash}`
        : '/');
    void handleRouteChange(initialPath);
  }, [handleRouteChange, router?.asPath]);

  return (
    <StyleProvider layer>
      <ConfigProvider theme={{ hashed: false }}>
        <Layout style={{ minHeight: '100vh' }} prefixCls={'dd'}>
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
