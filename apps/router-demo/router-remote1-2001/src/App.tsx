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
      <BrowserRouter basename="/">
        <ul>
          <li>
            <Link to="/" className="self-remote1-home-link">
              Home
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
