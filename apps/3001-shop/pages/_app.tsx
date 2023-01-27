import { useState } from 'react';
import App from 'next/app';
import dynamic from 'next/dynamic';
import { Layout, version } from 'antd';

// import { useMFClient } from '@module-federation/nextjs-mf/client';

import HostAppMenu from '../components/menu';

import 'antd/dist/antd.css';
import * as React from "react";
import singletonRouter from "next/dist/client/router";
const SharedNav = dynamic(
  async () => {
    const mod = await import('home/SharedNav');
    console.log(mod);
    return mod;
  },
  { ssr: true }
);


export function useMFClient(opts) {
  //@ts-ignore
  const MFClient = typeof window !== 'undefined' ? window.mf_client : /* TODO: inject here SSR version of MFClient if it will be needed in future */ {}


  const innerState = React.useRef({
    remote: undefined,
  });

  React.useEffect(() => {
    // Step 1: Define handlers and helpers
    const processRemoteChange = (remote) => {
      if (innerState.current.remote !== remote) {
        innerState.current.remote = remote;
        if (opts?.onChangeRemote) {
          opts.onChangeRemote(remote, MFClient);
        }
      }
    };

    const handleRouterChange = (pathname) => {
      if (MFClient.isFederatedPathname(pathname)) {
        const remote = MFClient.remotePages.routeToRemote(pathname);
        processRemoteChange(remote);
      } else {
        processRemoteChange(undefined);
      }
    };

    // Step 2: run bootstrap logic
    const initialRemote = MFClient.isFederatedPathname(window.location.pathname)
      ? MFClient.remotePages.routeToRemote(window.location.pathname)
      : undefined;

    if (initialRemote) {
      // important for first load to fire `onChangeRemote` with different remote
      // because in innerState by default we assume that used local application
      processRemoteChange(initialRemote);
    }

    // Step 3: Subscribe on events
    singletonRouter.events.on('routeChangeStart', handleRouterChange);
    return () => {
      singletonRouter.events.off('routeChangeStart', handleRouterChange);
    };
  }, []);

  return MFClient;
}

function MyApp({ Component, pageProps }) {
  console.log('in app')
  const [MenuComponent, setMenuComponent] = useState(() => HostAppMenu);

  // useMFClient({
  //   onChangeRemote: async (remote) => {
  //     if (remote) {
  //       const RemoteAppMenu =
  //         (await remote.getModule('./menu', 'default')) ||
  //         (() => null); /* or Empty menu component if undefined */
  //       setMenuComponent(() => RemoteAppMenu);
  //     } else {
  //       setMenuComponent(() => HostAppMenu);
  //     }
  //   },
  // });

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
    mfRoutes: {
      'home_app@http://localhost:3000/_next/static/chunks/remoteEntry.js': [
        '/',
        '/home',
      ],
      'shop@http://localhost:3001/_next/static/chunks/remoteEntry.js': [
        '/shop',
        '/shop/products/[...slug]',
      ],
      'checkout@http://localhost:3002/_next/static/chunks/remoteEntry.js': [
        '/checkout',
        '/checkout/exposed-pages',
      ],
      'unresolvedHost@http://localhost:3333/_next/static/chunks/remoteEntry.js':
        ['/unresolved-host'],
      'wrongEntry@http://localhost:3000/_next/static/chunks/remoteEntryWrong.js':
        ['/wrong-entry'],
    },
  };
};

export default MyApp;
