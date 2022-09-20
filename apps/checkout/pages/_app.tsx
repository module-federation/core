import { useState } from 'react';
import App from 'next/app';
import dynamic from 'next/dynamic';
import { Layout, version } from 'antd';

import { useMFClient } from '@module-federation/nextjs-mf/client';

import HostAppMenu from './_menu';

import 'antd/dist/antd.css';

const SharedNav = dynamic(
  () => {
    const mod = import('home/SharedNav').catch(console.error);
    return mod;
  },
  { ssr: false }
);

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
    mfRoutes: require('../../../mfRoutes'),
    // mfRoutes: {
    //   'home@http://localhost:3000/_next/static/chunks/remoteEntry.js': [
    //     '/',
    //     '/home',
    //   ],
    //   'shop@http://localhost:3001/_next/static/chunks/remoteEntry.js': [
    //     '/shop',
    //     '/shop/products/[...slug]',
    //   ],
    //   'checkout@http://localhost:3002/_next/static/chunks/remoteEntry.js': [
    //     '/checkout',
    //     '/checkout/exposed-pages',
    //   ],
    // },
  };
};

export default MyApp;
