import { useState } from 'react';
import App from 'next/app';
import dynamic from 'next/dynamic';
import { Layout, version } from 'antd';
import HostAppMenu from './_menu';
import { useMFRouter } from '@module-federation/nextjs-mf/lib/client/useMFRouter';

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
  useMFRouter({
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
  return appProps;
};

export default MyApp;
