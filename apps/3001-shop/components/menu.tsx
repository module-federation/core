import * as React from 'react';
import type { ItemType } from 'antd/es/menu/interface';

import { useRouter } from 'next/compat/router';
import { Menu } from 'antd';

const menuItems: ItemType[] = [
  { label: 'Main shop', key: '/shop' },
  { label: 'Product A', key: '/shop/products/A' },
  { label: 'Product B', key: '/shop/products/B' },
  { label: 'Exposed pages', key: '/shop/exposed-pages' },
  {
    label: 'Exposed components',
    type: 'group',
    children: [
      { label: 'shop/WebpackSvg', key: '/shop/test-webpack-svg' },
      { label: 'shop/WebpackPng', key: '/shop/test-webpack-png' },
    ],
  },
];

export default function AppMenu() {
  const router = useRouter();
  const [currentPath, setCurrentPath] = React.useState('/shop');

  React.useEffect(() => {
    const nextPath =
      router?.asPath ||
      (typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}${window.location.hash}`
        : '/shop');
    setCurrentPath(nextPath);
  }, [router?.asPath]);

  return (
    <>
      <div
        style={{ padding: '10px', fontWeight: 600, backgroundColor: '#fff' }}
      >
        Shop App Menu
      </div>
      <Menu
        mode="inline"
        selectedKeys={[currentPath]}
        style={{ height: '100%' }}
        onClick={({ key }) => {
          const href = String(key);
          if (router?.push) {
            router.push(href);
            return;
          }

          if (typeof window !== 'undefined') {
            window.location.assign(href);
          }
        }}
        items={menuItems}
      />
    </>
  );
}
