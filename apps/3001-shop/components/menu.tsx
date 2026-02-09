import * as React from 'react';
import type { ItemType } from 'antd/es/menu/interface';

import { Menu } from 'antd';
import { useRouter } from 'next/compat/router';

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

type AppMenuProps = {
  currentPath?: string;
};

export default function AppMenu({ currentPath }: AppMenuProps) {
  const router = useRouter();
  const resolvedPath = currentPath || '/shop';

  return (
    <div>
      <div
        style={{ padding: '10px', fontWeight: 600, backgroundColor: '#fff' }}
      >
        Shop App Menu
      </div>
      <Menu
        mode="inline"
        selectedKeys={[resolvedPath]}
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
    </div>
  );
}
