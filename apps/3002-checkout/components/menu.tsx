import type { ItemType } from 'antd/es/menu/interface';

import Router from 'next/router';
import { Menu } from 'antd';

const menuItems: ItemType[] = [
  { label: 'Main checkout', key: '/checkout' },
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
  const router = Router.router;
  const selectedKey =
    typeof window === 'undefined'
      ? router?.asPath || '/checkout'
      : window.location.pathname || router?.asPath || '/checkout';

  return (
    <>
      <div
        style={{ padding: '10px', fontWeight: 600, backgroundColor: '#fff' }}
      >
        Checkout App Menu
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
