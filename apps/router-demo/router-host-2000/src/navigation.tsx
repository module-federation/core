import {
  GroupOutlined,
  HomeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navgation() {
  const location = useLocation();
  const [current, setCurrent] = useState('/' + location.pathname.split('/')[1]);

  const items: MenuProps['items'] = [
    {
      label: <Link to="/">Home</Link>,
      key: '/',
      icon: <HomeOutlined />,
    },
    {
      label: <Link to="/detail">Detail</Link>,
      key: '/detail',
      icon: <GroupOutlined />,
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
      label: <Link to="/remote2">Remote2</Link>,
      key: '/remote2',
      icon: <GroupOutlined />,
      children: [
        {
          type: 'group',
          label: 'Sub Router',
          children: [
            {
              key: 'setting:1',
              label: (
                <Link
                  to="/remote2"
                  className="menu-remote2-home-link"
                  //  onClick={() => Info.setInitialEntrie("/")}
                >
                  Home
                </Link>
              ),
            },
            {
              key: 'setting:2',
              label: (
                <Link
                  to="/remote2/detail"
                  className="menu-remote2-detail-link"
                  // onClick={() => Info.setInitialEntrie("/detail")}
                >
                  Detail
                </Link>
              ),
            },
          ],
        },
      ],
    },
    {
      label: <Link to="/remote3">Remote3</Link>,
      key: '/remote3',
      icon: <GroupOutlined />,
      children: [
        {
          type: 'group',
          label: 'Sub Router',
          children: [
            {
              label: (
                <Link to="/remote3" className="menu-remote3-home-link">
                  Home
                </Link>
              ),
              key: 'remote3:setting:1',
            },
            {
              label: (
                <Link to="/remote3/detail" className="menu-remote3-detail-link">
                  Detail
                </Link>
              ),
              key: 'remote3:setting:2',
            },
          ],
        },
      ],
    },
    {
      label: <Link to="/memory-router">Memory-router</Link>,
      key: '/memory-router',
      icon: <GroupOutlined />,
    },
    {
      label: <Link to="/remote-render-error">render-error</Link>,
      key: '/remote-render-error',
      icon: <GroupOutlined />,
    },
    {
      label: <Link to="/remote-resource-error">resource-error</Link>,
      key: '/remote-resource-error',
      icon: <GroupOutlined />,
    },
    {
      label: <Link to="/error-load-with-hook">error-load-with-hook</Link>,
      key: '/error-load-with-hook',
      icon: <GroupOutlined />,
    },
    {
      label: (
        <Link to="/error-load-with-error-boundary">
          error-load-with-error-boundary
        </Link>
      ),
      key: '/error-load-with-error-boundary',
      icon: <GroupOutlined />,
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
