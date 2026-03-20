import type { ItemType } from 'antd/es/menu/interface';

import Router from 'next/router';
import { Menu } from 'antd';

const menuItems: ItemType[] = [{ label: 'Main home', key: '/' }];

export default function AppMenu() {
  const router = Router.router;
  const selectedKey =
    typeof window === 'undefined'
      ? router?.asPath || '/'
      : window.location.pathname || router?.asPath || '/';

  return (
    <>
      <div
        style={{ padding: '10px', fontWeight: 600, backgroundColor: '#fff' }}
      >
        Home App Menu
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
