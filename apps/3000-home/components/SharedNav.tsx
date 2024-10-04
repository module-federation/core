import React from 'react';
import { Menu, Layout } from 'antd';
import { useRouter } from 'next/router';
import './menu';

const SharedNav = () => {
  const { asPath, push } = useRouter();
  let activeMenu;

  if (asPath === '/' || asPath.startsWith('/home')) {
    activeMenu = '/';
  } else if (asPath.startsWith('/shop')) {
    activeMenu = '/shop';
  } else if (asPath.startsWith('/checkout')) {
    activeMenu = '/checkout';
  }

  const menuItems = [
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
        items={menuItems}
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
