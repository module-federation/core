import { Image } from 'antd';
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
  console.log('🏠 [Remote1] Home component render', { name, age });
  return (
    <div>
      <h2>Remote1 home page</h2>
      <h3>
        name: {name}, age: {age}
      </h3>
      <p style={{ color: '#1890ff', fontSize: '16px', fontWeight: 'bold' }}>
        🔍 观察点：当宿主的 count 变化时，这个组件应该不会重新渲染（如果启用了
        disableRerender）
      </p>
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

const App = (info: { name: string; age: number; count?: number }) => {
  console.log(
    '🔄 [Remote1] App render >>>>>>',
    info,
    'timestamp:',
    new Date().toISOString(),
  );
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
            <Link to="/" className="self-remote1-home-link">
              Home 【count: {info?.count}】
            </Link>
          </li>
          <li>
            <Link to="/detail" className="self-remote1-detail-link">
              Detail
            </Link>
          </li>
        </ul>

        <Switch>
          <Route path="/home">
            <Home {...info} />
          </Route>
          <Route path="/detail">
            <Detail />
          </Route>
          <Route path="/">
            <Home {...info} />
          </Route>
        </Switch>
      </BrowserRouter>
    </StyleProvider>
  );
};

export default App;
