import * as React from 'react';
import type { ItemType } from 'antd/es/menu/interface';

import { Menu } from 'antd';
import { useRouter } from 'next/compat/router';

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

type AppMenuProps = {
  currentPath?: string;
};

export default function AppMenu({ currentPath }: AppMenuProps) {
  const router = useRouter();
  const resolvedPath = currentPath || '/';

  return (
    <div>
      <div
        style={{ padding: '10px', fontWeight: 600, backgroundColor: '#fff' }}
      >
        Home App Menu
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
