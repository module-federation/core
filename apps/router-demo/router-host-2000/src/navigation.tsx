import {
  GroupOutlined,
  HomeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu, Timeline } from 'antd';
import type React from 'react';
import { useState } from 'react';
import {
  BrowserRouter,
  Link,
  Route,
  Router,
  RouterProvider,
  Routes,
  createBrowserRouter,
  useLocation,
} from 'react-router-dom';

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
        // {
        //   type: 'group',
        //   label: 'change data',
        //   children: [
        //     {
        //       key: 'setting:3',
        //       label: (
        //         <div onClick={() => Info.setAbc(123)}>Change data: 123</div>
        //       ),
        //     },
        //     {
        //       key: 'setting:4',
        //       label: (
        //         <div onClick={() => Info.setAbc(2345)}>Change data: 2345</div>
        //       ),
        //     },
        //   ],
        // },
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
