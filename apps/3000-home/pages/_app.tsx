import * as React from 'react';
import { useState } from 'react';
import App from 'next/app';
import { Layout, version } from 'antd';
import Router, { useRouter } from 'next/router';
const SharedNav = React.lazy(() => import('../components/SharedNav'));
import HostAppMenu from '../components/menu';
import 'antd/dist/antd.css';
function MyApp(props) {
  const { Component, pageProps } = props;
  const { asPath } = useRouter();
  const [MenuComponent, setMenuComponent] = useState(() => HostAppMenu);
  const handleRouteChange = async (url) => {
    if (url.startsWith('/shop')) {
      // @ts-ignore
      const RemoteAppMenu = (await import('shop/menu')).default;
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
  React.useMemo(() => handleRouteChange(asPath), [asPath]);

  //handle route change
  React.useEffect(() => {
    // Step 3: Subscribe on events
    Router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      Router.events.off('routeChangeStart', handleRouteChange);
    };
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
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
            style={{ background: '#fff', color: '#999', textAlign: 'center' }}
          >
            antd@{version}
          </Layout.Footer>
        </Layout>
      </Layout>
    </Layout>
  );
}

MyApp.getInitialProps = async (ctx) => {
  return App.getInitialProps(ctx);
};

export default MyApp;
