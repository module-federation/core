import { Image } from 'antd';
import type { ComponentType } from 'react';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';
import {
  StyleProvider,
  legacyLogicalPropertiesTransformer,
} from '@ant-design/cssinjs';
import { useShadowRoot } from 'react-shadow';
import { Table } from 'antd';

const dataSource = [
  {
    key: '1',
    name: 'Zack',
    age: 32,
    address: '西湖区湖底公园1号',
  },
  {
    key: '2',
    name: 'Jack',
    age: 42,
    address: '西湖区湖底公园1号',
  },
];

const BrowserRouterAny = BrowserRouter as unknown as ComponentType<any>;
const LinkAny = Link as unknown as ComponentType<any>;
const RouteAny = Route as unknown as ComponentType<any>;
const SwitchAny = Switch as unknown as ComponentType<any>;

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

function Home({ name, age }: { name: string; age: number }) {
  return (
    <div>
      <h2>Remote1 home page</h2>
      <h3>
        name: {name}, age: {age}
      </h3>
      <Table dataSource={dataSource} columns={columns} />
    </div>
  );
}

function Detail() {
  return (
    <>
      <h2>Remote1 detail page</h2>
      <Image
        width={200}
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
      />
    </>
  );
}

const App = (info: { name: string; age: number }) => {
  const container = useShadowRoot();
  return (
    <StyleProvider
      container={container}
      hashPriority="high"
      transformers={[legacyLogicalPropertiesTransformer]}
    >
      <BrowserRouterAny basename="/">
        <ul>
          <li>
            <LinkAny to="/" className="self-remote1-home-link">
              Home
            </LinkAny>
          </li>
          <li>
            <LinkAny to="/detail" className="self-remote1-detail-link">
              Detail
            </LinkAny>
          </li>
        </ul>

        <SwitchAny>
          <RouteAny path="/home">
            <Home {...info} />
          </RouteAny>
          <RouteAny path="/detail">
            <Detail />
          </RouteAny>
          <RouteAny path="/">
            <Home {...info} />
          </RouteAny>
        </SwitchAny>
      </BrowserRouterAny>
    </StyleProvider>
  );
};

export default App;
