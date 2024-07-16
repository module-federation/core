import { Image } from 'antd';
import {
  BrowserRouter,
  Link,
  Outlet,
  Route,
  RouterProvider,
  Routes,
  createBrowserRouter,
  createHashRouter,
  createMemoryRouter,
} from 'react-router-dom';
import './App.css';
import styled from '@emotion/styled';

const HomeDiv = styled.div`
  color: turquoise;
`;

function Home() {
  return (
    <HomeDiv>
      <h2>Remote2 home page</h2>
      <div>hello sub home page</div>
      <div>React router v6 + React 18</div>
    </HomeDiv>
  );
}

function Detail() {
  return (
    <>
      <h2>Remote2 detail page</h2>
      <div>hello sub2 detail page</div>
      <Image
        width={200}
        src="https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp"
      />
    </>
  );
}

function Layout() {
  return (
    <>
      <ul>
        <li>
          <Link to="/" className="self-remote2-home-link">
            Home
          </Link>
        </li>
        <li>
          <Link to="/detail" className="self-remote2-detail-link">
            Detail
          </Link>
        </li>
      </ul>
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: '/detail',
        element: <Detail />,
      },
    ],
  },
]);

console.log('=====router', router);

const App = (info?: { basename?: string; initialEntries?: Array<string> }) => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

const App2 = ({ basename }: any) => {
  return (
    <BrowserRouter basename={basename}>
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
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/home" Component={Home} />
        <Route path="/detail" Component={Detail} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
