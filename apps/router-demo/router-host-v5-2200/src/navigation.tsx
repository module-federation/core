import {
  GroupOutlined,
  HomeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu, Timeline } from 'antd';
import type React from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navgation(Info: {
  setInitialEntrie: (value: React.SetStateAction<string>) => void;
  setAbc: (value: React.SetStateAction<number>) => void;
}) {
  const location = useLocation();
  const [current, setCurrent] = useState('/' + location.pathname.split('/')[1]);

  const items: MenuProps['items'] = [
    {
      label: <Link to="/">Home</Link>,
      key: '/',
      icon: <HomeOutlined />,
    },
    {
      label: 'Remote1',
      key: '/remote1',
      icon: <SettingOutlined />,
      children: [
        {
          type: 'group',
          label: 'Sub Router',
          children: [
            {
              label: (
                <Link to="/remote1" className="menu-remote1-home-link">
                  Home
                </Link>
              ),
              key: 'remote1:setting:1',
            },
            {
              label: (
                <Link to="/remote1/detail" className="menu-remote1-detail-link">
                  Detail
                </Link>
              ),
              key: 'remote1:setting:2',
            },
          ],
        },
      ],
    },
    {
      label: 'Remote2',
      key: '/remote2',
      icon: <SettingOutlined />,
      children: [
        {
          type: 'group',
          label: 'Sub Router',
          children: [
            {
              label: (
                <Link to="/remote2" className="menu-remote1-home-link">
                  Home
                </Link>
              ),
              key: 'remote2:setting:1',
            },
            {
              label: (
                <Link to="/remote2/detail" className="menu-remote1-detail-link">
                  Detail
                </Link>
              ),
              key: 'remote2:setting:2',
            },
          ],
        },
      ],
    },
    {
      label: 'Remote3',
      key: '/remote3',
      icon: <SettingOutlined />,
      children: [
        {
          type: 'group',
          label: 'Sub Router',
          children: [
            {
              label: (
                <Link to="/remote3" className="menu-remote1-home-link">
                  Home
                </Link>
              ),
              key: 'remote3:setting:1',
            },
            {
              label: (
                <Link to="/remote3/detail" className="menu-remote1-detail-link">
                  Detail
                </Link>
              ),
              key: 'remote3:setting:2',
            },
          ],
        },
      ],
    },
  ];

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
  };
  return (
    <Menu
      className="host-menu"
      onClick={onClick}
      selectedKeys={[current]}
      mode="horizontal"
      items={items}
    />
  );
}

export default Navgation;
