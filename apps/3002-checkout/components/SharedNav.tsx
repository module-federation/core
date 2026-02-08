import React from 'react';
import { Menu, Layout } from 'antd';
import { useRouter } from 'next/compat/router';

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

const SharedNav = ({ currentPath }: SharedNavProps) => {
  const router = useRouter();
  const activeMenu = getActiveMenu(currentPath);

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
          if (router?.push) {
            router.push(key);
            return;
          }

          if (typeof window !== 'undefined') {
            window.location.assign(key);
          }
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
