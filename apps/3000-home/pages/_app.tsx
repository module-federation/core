import * as React from 'react';
import { init } from '@module-federation/runtime';
import App from 'next/app';
import { Layout, version, ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import { useRouter } from 'next/compat/router';
import SharedNav from '../components/SharedNav';
import HostAppMenu from '../components/menu';

function MyApp(props) {
  const { Component, pageProps } = props;
  const router = useRouter();
  const resolvedPath =
    router?.asPath ||
    router?.pathname ||
    (typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}${window.location.hash}`
      : '/');
  const [MenuComponent, setMenuComponent] = React.useState(() => HostAppMenu);

  const handleRouteChange = React.useCallback(async (url: string) => {
    if (url.startsWith('/shop')) {
      const RemoteAppMenu = (await import('shop/menu')).default;
      setMenuComponent(() => RemoteAppMenu);
      return;
    }

    if (url.startsWith('/checkout')) {
      const RemoteAppMenu = (await import('checkout/menu')).default;
      setMenuComponent(() => RemoteAppMenu);
      return;
    }

    setMenuComponent(() => HostAppMenu);
  }, []);

  React.useEffect(() => {
    const initialPath =
      router?.asPath ||
      (typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}${window.location.hash}`
        : '/');
    void handleRouteChange(initialPath);
  }, [handleRouteChange, router?.asPath]);

  React.useEffect(() => {
    if (!router?.events) {
      return;
    }

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [handleRouteChange, router?.events]);

  return (
    <StyleProvider layer>
      <ConfigProvider theme={{ hashed: false }}>
        <Layout style={{ minHeight: '100vh' }} prefixCls={'dd'}>
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
