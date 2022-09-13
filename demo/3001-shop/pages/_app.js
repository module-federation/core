import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Layout, version } from 'antd';
import HostAppMenu from './_menu';
import { useMFClient } from '@module-federation/nextjs-mf/lib/client/useMFClient';

import 'antd/dist/antd.css';

const SharedNav = dynamic(
  () => {
    const mod = import('home/SharedNav');
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

export default MyApp;
