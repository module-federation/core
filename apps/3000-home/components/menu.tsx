import * as React from 'react';
import type { ItemType } from 'antd/es/menu/interface';

import { useRouter } from 'next/compat/router';
import { Menu } from 'antd';

const menuItems: ItemType[] = [
  { label: 'Main home', key: '/' },
  { label: 'Test hook from remote', key: '/home/test-remote-hook' },
  { label: 'Test broken remotes', key: '/home/test-broken-remotes' },
  { label: 'Exposed pages', key: '/home/exposed-pages' },
  {
    label: 'Exposed components',
    type: 'group',
    children: [{ label: 'home/SharedNav', key: '/home/test-shared-nav' }],
  },
];

export default function AppMenu() {
  const router = useRouter();
  const [currentPath, setCurrentPath] = React.useState('/');

  React.useEffect(() => {
    const nextPath =
      router?.asPath ||
      (typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}${window.location.hash}`
        : '/');
    setCurrentPath(nextPath);
  }, [router?.asPath]);

  return (
    <>
      <div
        style={{ padding: '10px', fontWeight: 600, backgroundColor: '#fff' }}
      >
        Home App Menu
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
