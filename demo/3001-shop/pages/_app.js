import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import router from 'next/router';
import { Layout, version } from 'antd';
import AppMenu from './_menu';
import { injectScript } from '@module-federation/nextjs-mf/lib/utils';

import 'antd/dist/antd.css';

const SharedNav = dynamic(
  () => {
    const mod = import('home/SharedNav');
    return mod;
  },
  { ssr: false }
);

async function getMFMenuComponent(pathname) {
  const route = window?.mf_loader?.pathnameToRoute(pathname);
  if (route) {
    const remote = window?.mf_loader?.pageListFederated?.[route]?.remote;
    if (remote) {
      // set remote menu
      const container = await injectScript(remote);
      const Component = (await container.get('./pages/_menu'))().default;
      return Component;
    } else {
      return () => null;
    }
  } else {
    return AppMenu;
  }
}

function MyApp({ Component, pageProps }) {
  const [MenuComponent, setMenuComponent] = useState(() => AppMenu);
  useEffect(() => {
    const handleRouteChange = async (url) => {
      const RouteMenu = await getMFMenuComponent(url);
      if (MenuComponent !== RouteMenu) {
        setMenuComponent(() => RouteMenu);
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [MenuComponent]);
  useEffect(() => {
    // This code is used for first rendering
    // for loading correct menu of remote apps
    getMFMenuComponent(router.pathname).then((RouteMenu) => {
      if (RouteMenu !== MenuComponent) {
        setMenuComponent(() => RouteMenu);
      }
    });
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

export default MyApp;
