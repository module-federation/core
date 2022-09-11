import {Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Layout, version } from 'antd';
import App from 'next/app';
import AppMenu from './_menu';

const SharedNav = dynamic(
  () => {
    const mod = import('home/SharedNav');
    return mod;
  },
  // must use suspense until chunk flushing is implemented for SSR. Otherwise, we get hydration errors
  // since we are missing chunks in initial render, webpack needs to go fetch them at runtime
  // this causes hydration error or flicker as next expects chunks to be loaded and ready before render
  { suspense: true }
);

function MyApp({ Component, pageProps }) {
  const [MenuComponent, setMenuComponent] = useState(() => AppMenu);
  useEffect(() => {
    const cb = ({ detail }) => {
      if (detail && detail !== MenuComponent) setMenuComponent(() => detail);
    };
    window.addEventListener('federated-menu', cb);
    return () => {
      window.removeEventListener('federated-menu', cb);
    };
  }, []);

  // Return back App menu if federated page does not used
  const { pathname } = useRouter();
  useEffect(() => {
    if (pathname !== '/[...federatedPage]' && MenuComponent !== AppMenu) {
      setMenuComponent(() => AppMenu);
    }
  }, [pathname]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Suspense fallback={'Loading Nav'}>
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
  console.log('loading app real');
  const props = await App.getInitialProps(ctx);
  console.log('props');

  console.log('after');

  return { ...props };
};

export default MyApp;
