import type { ItemType } from 'antd/es/menu/interface';

import Router from 'next/router';
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
  const router = (
    Router as typeof Router & {
      router?: {
        asPath?: string;
        push: (url: string) => Promise<boolean>;
      };
    }
  ).router;
  const selectedKey =
    typeof window !== 'undefined'
      ? window.location.pathname || router?.asPath || '/shop'
      : router?.asPath || '/shop';

  return (
    <>
      <div
        style={{ padding: '10px', fontWeight: 600, backgroundColor: '#fff' }}
      >
        Shop App Menu
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{ height: '100%' }}
        onClick={({ key }) => {
          if (typeof window === 'undefined') {
            return;
          }
          if (router) {
            void router.push(String(key));
            return;
          }
          window.location.assign(String(key));
        }}
        items={menuItems}
      />
    </>
  );
}
