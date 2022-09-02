import { useEffect, useState } from 'react';
import App from 'next/app';
import { Layout, version } from 'antd';
import router from 'next/router';
import AppMenu from './_menu';
import SharedNav from '../components/SharedNav';
import { injectScript } from '@module-federation/nextjs-mf/lib/utils';

async function getMFMenuComponent(pathname) {
  const route = window?.mf_router?.pathnameToRoute(pathname);
  if (route) {
    const remote = window?.mf_router?.pageListFederated?.[route]?.remote;
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

MyApp.getInitialProps = async (ctx) => {
  const appProps = await App.getInitialProps(ctx);
  return appProps;
};

export default MyApp;
