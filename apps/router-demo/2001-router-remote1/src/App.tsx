import { Image } from 'antd';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import {
  StyleProvider,
  legacyLogicalPropertiesTransformer,
} from '@ant-design/cssinjs';
import { Table } from 'antd';
import { useShadowRoot, ShadowRoot } from './shadow';
import { useEffect, useRef } from 'react';

const dataSource = [
  {
    key: '1',
    name: '胡彦斌',
    age: 32,
    address: '西湖区湖底公园1号',
  },
  {
    key: '2',
    name: '胡彦祖',
    age: 42,
    address: '西湖区湖底公园1号',
  },
];

const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: '住址',
    dataIndex: 'address',
    key: 'address',
  },
];

// import "./App.css";

function Home() {
  return (
    <div>
      hello sub home page
      <Table dataSource={dataSource} columns={columns} />
    </div>
  );
}

function Detail() {
  return (
    <>
      <div>hello sub detail page</div>
      <Image
        width={200}
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
      />
    </>
  );
}

const App = (info: any) => {
  const container = useShadowRoot();
  return (
    <StyleProvider
      container={container}
      hashPriority="high"
      transformers={[legacyLogicalPropertiesTransformer]}
    >
      <BrowserRouter basename="/">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/detail">Detail</Link>
          </li>
        </ul>
        <Routes>
          <Route path="/" Component={Home} />
          <Route path="/detail" Component={Detail} />
        </Routes>
      </BrowserRouter>
    </StyleProvider>
  );
};

export default App;
