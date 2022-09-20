import { useState } from 'react';
import App from 'next/app';
import { Layout, version } from 'antd';

import { useMFClient } from '@module-federation/nextjs-mf/client';

import SharedNav from '../components/SharedNav';
import HostAppMenu from './_menu';

import 'antd/dist/antd.css';

function MyApp({ Component, pageProps }) {
  const [MenuComponent, setMenuComponent] = useState(() => HostAppMenu);

  useMFClient({
    onChangeRemote: async (remote) => {
      if (remote) {
        const RemoteAppMenu =
          (await remote.getModule('./pages/_menu', 'default')) ||
          (() => null); /* or Empty menu component if undefined */
        setMenuComponent(() => RemoteAppMenu);
      } else {
        setMenuComponent(() => HostAppMenu);
      }
    },
  });

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
  const appProps = await App.getInitialProps(ctx);

  return {
    ...appProps,
    mfRoutes: (await import('@internal/shared')).mfRoutes,
    // mfRoutes: {
    //   'home_app@http://localhost:4200/_next/static/chunks/remoteEntry.js': [
    //     '/',
    //     '/home',
    //   ],
    //   'shop@http://localhost:4201/_next/static/chunks/remoteEntry.js': [
    //     '/shop',
    //     '/shop/products/[...slug]',
    //   ],
    //   'checkout@http://localhost:4202/_next/static/chunks/remoteEntry.js': [
    //     '/checkout',
    //     '/checkout/exposed-pages',
    //   ],
    //   'unresolvedHost@http://localhost:3333/_next/static/chunks/remoteEntry.js':
    //     ['/unresolved-host'],
    //   'wrongEntry@http://localhost:4200/_next/static/chunks/remoteEntryWrong.js':
    //     ['/wrong-entry'],
    // },
  };
};

export default MyApp;
