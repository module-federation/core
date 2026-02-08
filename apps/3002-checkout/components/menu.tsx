import * as React from 'react';
import type { ItemType } from 'antd/es/menu/interface';

import { useRouter } from 'next/compat/router';
import { Menu } from 'antd';

const menuItems: ItemType[] = [
  { label: 'Main checkout', key: '/checkout' },
  { label: 'Exposed pages', key: '/checkout/exposed-pages' },
  {
    label: 'Exposed components',
    type: 'group',
    children: [
      { label: 'checkout/CheckoutTitle', key: '/checkout/test-title' },
      { label: 'checkout/ButtonOldAnt', key: '/checkout/test-check-button' },
    ],
  },
];

export default function AppMenu() {
  const router = useRouter();
  const [currentPath, setCurrentPath] = React.useState('/checkout');

  React.useEffect(() => {
    const nextPath =
      router?.asPath ||
      (typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}${window.location.hash}`
        : '/checkout');
    setCurrentPath(nextPath);
  }, [router?.asPath]);

  return (
    <>
      <div
        style={{ padding: '10px', fontWeight: 600, backgroundColor: '#fff' }}
      >
        Checkout App Menu
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
