import * as React from 'react';
import { useState } from 'react';
import { init } from '@module-federation/runtime';
console.log('logging init', typeof init);
import App from 'next/app';
import { Layout, version, ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';

import Router, { useRouter } from 'next/router';
const SharedNav = React.lazy(() => import('../components/SharedNav'));
import HostAppMenu from '../components/menu';
function MyApp(props) {
  const { Component, pageProps } = props;
  const { asPath } = useRouter();
  const [MenuComponent, setMenuComponent] = useState(() => HostAppMenu);

  // Add HMR support for federation modules
  React.useEffect(() => {
    if (typeof module !== 'undefined' && module.hot) {
      // Accept updates for federation modules
      module.hot.accept(['shop/menu', 'checkout/menu'], () => {
        console.log('[HMR] Federation module updated, forcing re-import');
        // Force re-import by clearing the current menu and re-triggering route change
        handleRouteChange(asPath);
      });
    }
  }, []);
  const handleRouteChange = async (url) => {
    try {
      if (url.startsWith('/shop')) {
        // Check if we need to force refresh the federation module
        const forceRefresh =
          typeof window !== 'undefined' &&
          (window as any).__FEDERATION_FORCE_REFRESH__;
        const cacheKey = forceRefresh
          ? `shop/menu?t=${Date.now()}`
          : 'shop/menu';
        console.log('[HMR] Loading shop menu', { forceRefresh, cacheKey });

        // @ts-ignore
        const RemoteAppMenu = (await import('shop/menu')).default;
        setMenuComponent(() => RemoteAppMenu);
      } else if (url.startsWith('/checkout')) {
        // Check if we need to force refresh the federation module
        const forceRefresh =
          typeof window !== 'undefined' &&
          (window as any).__FEDERATION_FORCE_REFRESH__;
        const cacheKey = forceRefresh
          ? `checkout/menu?t=${Date.now()}`
          : 'checkout/menu';
        console.log('[HMR] Loading checkout menu', { forceRefresh, cacheKey });

        // @ts-ignore
        const RemoteAppMenu = (await import('checkout/menu')).default;
        setMenuComponent(() => RemoteAppMenu);
      } else {
        setMenuComponent(() => HostAppMenu);
      }
    } catch (error) {
      console.error('[HMR] Error loading federation module:', error);
      // Fallback to host menu on error
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
        <Layout style={{ minHeight: '100vh' }} prefixCls={'dd'}>
          <React.Suspense>
            <SharedNav />
          </React.Suspense>
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
