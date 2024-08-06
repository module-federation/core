import type { ItemType } from 'antd/es/menu/interface';

import { useRouter } from 'next/router';
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

  return (
    <>
      <div
        style={{ padding: '10px', fontWeight: 600, backgroundColor: '#fff' }}
      >
        Home App Menu
      </div>
      <Menu
        mode="inline"
        selectedKeys={[router.asPath]}
        style={{ height: '100%' }}
        onClick={({ key }) => router.push(key)}
        items={menuItems}
      />
    </>
  );
}
