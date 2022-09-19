import React from 'react';
import { Menu, Layout, Badge } from 'antd';
import { useRouter } from 'next/router';

import { useMFRemote } from '@module-federation/nextjs-mf/client';

const SharedNav = () => {
  const { asPath, push } = useRouter();

  // is used here as a demo for tracking loading status of remote container
  const homeRemote = useMFRemote('home');
  const shopRemote = useMFRemote('shop');
  const checkoutRemote = useMFRemote('checkout');

  let activeMenu;
  if (asPath === '/' || asPath.startsWith('/home')) {
    activeMenu = '/';
  } else if (asPath.startsWith('/shop')) {
    activeMenu = '/shop';
  } else if (asPath.startsWith('/checkout')) {
    activeMenu = '/checkout';
  }

  const badgeColor = (remoteData) =>
    remoteData.error ? 'red' : remoteData.loaded ? 'green' : 'yellow';

  return (
    <Layout.Header>
      <div className="header-logo">nextjs-mf</div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={activeMenu ? [activeMenu] : undefined}
        onClick={({ key }) => {
          push(key);
        }}
        items={[
          {
            label: (
              <>
                <Badge color={badgeColor(homeRemote)} />
                Home <sup>3000</sup>
              </>
            ),
            key: '/',
            onMouseEnter: () => {
              // prefetch remote container on HOVER manually
              // if you use `next/link` it prefetches remoteEntry automatically
              // but here Antd.Menu does not use Link, so do it manually
              homeRemote.remote.getContainer();
            },
          },
          {
            label: (
              <>
                <Badge color={badgeColor(shopRemote)} />
                Shop <sup>3001</sup>
              </>
            ),
            key: '/shop',
            onMouseEnter: () => shopRemote.remote.getContainer(),
          },
          {
            label: (
              <>
                <Badge color={badgeColor(checkoutRemote)} />
                Checkout <sup>3002</sup>
              </>
            ),
            key: '/checkout',
            onMouseEnter: () => checkoutRemote.remote.getContainer(),
          },
        ]}
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

export default SharedNav;
