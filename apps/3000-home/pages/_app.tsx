import { useState } from 'react';
import App from 'next/app';
import { Layout, version } from 'antd';
import { useRouter } from 'next/router';
import { useMFClient } from '@module-federation/nextjs-mf/client';

import SharedNav from '../components/SharedNav';
import HostAppMenu from '../components/menu';
import 'antd/dist/antd.css';
import * as React from 'react';
import Router from 'next/router';

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
  React.useMemo(() => handleRouteChange(asPath), []);

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

  // return {
  //   ...appProps,
  //   mfRoutes: {
  //     'home_app@http://localhost:3000/_next/static/chunks/remoteEntry.js': [
  //       '/',
  //       '/home',
  //     ],
  //     'shop@http://localhost:3001/_next/static/chunks/remoteEntry.js': [
  //       '/shop',
  //       '/shop/products/[...slug]',
  //     ],
  //     'checkout@http://localhost:3002/_next/static/chunks/remoteEntry.js': [
  //       '/checkout',
  //       '/checkout/exposed-pages',
  //     ],
  //     'unresolvedHost@http://localhost:3333/_next/static/chunks/remoteEntry.js':
  //       ['/unresolved-host'],
  //     'wrongEntry@http://localhost:3000/_next/static/chunks/remoteEntryWrong.js':
  //       ['/wrong-entry'],
  //   },
  // };
};

export default MyApp;
