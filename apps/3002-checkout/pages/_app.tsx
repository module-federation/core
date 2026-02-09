import React, { Suspense } from 'react';
import App from 'next/app';
import { Layout, version, ConfigProvider, Menu } from 'antd';
import { useRouter } from 'next/compat/router';
import { StyleProvider } from '@ant-design/cssinjs';

import HostAppMenu from '../components/menu';

const SharedNav = React.lazy(() => import('home/SharedNav'));

type SharedNavProps = {
  currentPath?: string;
};

function getActiveMenu(path: string | undefined): string | undefined {
  if (!path) {
    return undefined;
  }

  if (path === '/' || path.startsWith('/home')) {
    return '/';
  }

  if (path.startsWith('/shop')) {
    return '/shop';
  }

  if (path.startsWith('/checkout')) {
    return '/checkout';
  }

  return undefined;
}

const sharedNavItems = [
  {
    className: 'home-menu-link',
    label: (
      <>
        Home <sup>3000</sup>
      </>
    ),
    key: '/',
  },
  {
    className: 'shop-menu-link',
    label: (
      <>
        Shop <sup>3001</sup>
      </>
    ),
    key: '/shop',
  },
  {
    className: 'checkout-menu-link',
    label: (
      <>
        Checkout <sup>3002</sup>
      </>
    ),
    key: '/checkout',
  },
];

const SharedNavFallback = ({ currentPath }: SharedNavProps) => {
  const router = useRouter();
  const activeMenu = getActiveMenu(currentPath);

  return (
    <Layout.Header>
      <div className="header-logo">nextjs-mf</div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={activeMenu ? [activeMenu] : undefined}
        onClick={({ key }) => {
          if (router?.push) {
            router.push(key);
            return;
          }

          if (typeof window !== 'undefined') {
            window.location.assign(key);
          }
        }}
        items={sharedNavItems}
      />
      <style jsx>
        {`
          .header-logo {
            float: left;
            width: 200px;
            height: 31px;
            margin-right: 24px;
            color: white;
            font-size: 2rem;
          }
        `}
      </style>
    </Layout.Header>
  );
};

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);
  const resolvedPath =
    router?.asPath ||
    router?.pathname ||
    (typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}${window.location.hash}`
      : '/checkout');
  const [MenuComponent, setMenuComponent] = React.useState(() => HostAppMenu);

  const handleRouteChange = React.useCallback(async (url: string) => {
    if (url.startsWith('/home') || url === '/') {
      const RemoteAppMenu = (await import('home/menu')).default;
      setMenuComponent(() => RemoteAppMenu);
      return;
    }

    if (url.startsWith('/shop')) {
      const RemoteAppMenu = (await import('shop/menu')).default;
      setMenuComponent(() => RemoteAppMenu);
      return;
    }

    setMenuComponent(() => HostAppMenu);
  }, []);

  React.useEffect(() => {
    const initialPath =
      router?.asPath ||
      (typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}${window.location.hash}`
        : '/checkout');
    void handleRouteChange(initialPath);
  }, [handleRouteChange, router?.asPath]);

  React.useEffect(() => {
    if (!router?.events) {
      return;
    }

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [handleRouteChange, router?.events]);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <StyleProvider layer>
      <ConfigProvider theme={{ hashed: false }}>
        <Layout style={{ minHeight: '100vh' }}>
          {isMounted ? (
            <Suspense
              fallback={<SharedNavFallback currentPath={resolvedPath} />}
            >
              <SharedNav currentPath={resolvedPath} />
            </Suspense>
          ) : (
            <SharedNavFallback currentPath={resolvedPath} />
          )}
          <Layout>
            <Layout.Sider width={200}>
              <MenuComponent currentPath={resolvedPath} />
            </Layout.Sider>
            <Layout>
              <Layout.Content style={{ background: '#fff', padding: 20 }}>
                <Component {...pageProps} />
              </Layout.Content>
              <Layout.Footer
                style={{
                  background: '#fff',
                  color: '#999',
                  textAlign: 'center',
                }}
              >
                antd@{version}
              </Layout.Footer>
            </Layout>
          </Layout>
        </Layout>
      </ConfigProvider>
    </StyleProvider>
  );
}

MyApp.getInitialProps = async (ctx) => {
  return App.getInitialProps(ctx);
};

export default MyApp;
