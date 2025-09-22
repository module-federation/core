import React, { Suspense, useState, lazy } from 'react';
import App from 'next/app';
import { Layout, version, ConfigProvider } from 'antd';
import Router, { useRouter } from 'next/router';
import { StyleProvider } from '@ant-design/cssinjs';
import HostAppMenu from '../components/menu';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const SharedNav = lazy(() => import('home/SharedNav'));

function MyApp({ Component, pageProps }) {
  const { asPath } = useRouter();
  const [MenuComponent, setMenuComponent] = useState(() => HostAppMenu);
  const [queryClient] = React.useState(() => {
    if (typeof window === 'undefined') {
      return new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      });
    }
    const w = window as any;
    w.__mfQueryClient =
      w.__mfQueryClient ||
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      });
    return w.__mfQueryClient as QueryClient;
  });
  const handleRouteChange = async (url) => {
    if (url.startsWith('/home') || url === '/') {
      // @ts-ignore
      const RemoteAppMenu = (await import('home/menu')).default;
      setMenuComponent(() => RemoteAppMenu);
    } else if (url.startsWith('/checkout')) {
      // @ts-ignore
      const RemoteAppMenu = (await import('checkout/menu')).default;
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
        <QueryClientProvider client={queryClient}>
          <Layout style={{ minHeight: '100vh' }}>
            <Suspense fallback={'loading'}>
              <SharedNav />
            </Suspense>
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
            {process.env.NODE_ENV !== 'production' ? (
              <ReactQueryDevtools initialIsOpen={false} />
            ) : null}
          </Layout>
        </QueryClientProvider>
      </ConfigProvider>
    </StyleProvider>
  );
}

MyApp.getInitialProps = async (ctx) => {
  return App.getInitialProps(ctx);
};

export default MyApp;
