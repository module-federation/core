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
      <div>hello sub home page</div>
      <div>React router v6 + React 18</div>
    </HomeDiv>
  );
}

function Detail() {
  return (
    <>
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
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/detail">Detail</Link>
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

const App = (info?: { basename?: string; initialEntries?: Array<string> }) => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
