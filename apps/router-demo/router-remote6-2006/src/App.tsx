import { Image } from 'antd';
import {
  Link,
  Outlet,
  createBrowserRouter,
  RouterProvider,
  useRouteError,
} from 'react-router';
import './App.css';
import styled from '@emotion/styled';

const HomeDiv = styled.div`
  color: purple;
`;

const ErrorDiv = styled.div`
  color: red;
  padding: 20px;
  border: 1px solid red;
  border-radius: 8px;
  margin: 20px 0;
`;

function ErrorBoundary() {
  const error = useRouteError() as Error;

  return (
    <ErrorDiv>
      <h2>Oops! Something went wrong in Remote6</h2>
      <p>{error?.message || 'An unexpected error occurred'}</p>
      <details>
        <summary>Error details</summary>
        <pre>{error?.stack}</pre>
      </details>
    </ErrorDiv>
  );
}

function Home() {
  return (
    <HomeDiv>
      <h2>Remote6 home page</h2>
      <div>hello remote6 home page</div>
      <div>🎉 React Router v7 + React 18 + Module Federation</div>
      <div>✨ Features: Data APIs, Type Safety, Future Flags</div>
    </HomeDiv>
  );
}

function Detail() {
  return (
    <>
      <h2>Remote6 detail page</h2>
      <div>hello remote6 detail page with React Router v7</div>
      <div>🚀 Enhanced routing with better performance and DX</div>
      <Image
        width={200}
        src="https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp"
        alt="Sample image"
      />
    </>
  );
}

function About() {
  return (
    <>
      <h2>Remote6 about page</h2>
      <div>This is a React Router v7 demo in Module Federation</div>
      <div>🔥 New features in v7:</div>
      <ul>
        <li>Improved data loading patterns</li>
        <li>Better TypeScript support</li>
        <li>Enhanced error boundaries</li>
        <li>Future-ready APIs</li>
      </ul>
    </>
  );
}

function Layout() {
  return (
    <div
      style={{
        padding: '20px',
        border: '2px solid purple',
        borderRadius: '8px',
      }}
    >
      <h1>🎯 Remote6 - React Router v7 Demo</h1>
      <nav style={{ marginBottom: '20px' }}>
        <ul
          style={{
            display: 'flex',
            gap: '20px',
            listStyle: 'none',
            padding: 0,
          }}
        >
          <li>
            <Link
              to="/"
              className="self-remote6-home-link"
              style={{
                textDecoration: 'none',
                padding: '8px 16px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
              }}
            >
              🏠 Home
            </Link>
          </li>
          <li>
            <Link
              to="/detail"
              className="self-remote6-detail-link"
              style={{
                textDecoration: 'none',
                padding: '8px 16px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
              }}
            >
              📄 Detail
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className="self-remote6-about-link"
              style={{
                textDecoration: 'none',
                padding: '8px 16px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
              }}
            >
              ℹ️ About
            </Link>
          </li>
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

// React Router v7 style router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'detail',
        element: <Detail />,
      },
      {
        path: 'about',
        element: <About />,
      },
    ],
  },
]);

const App = (info?: { basename?: string; initialEntries?: Array<string> }) => {
  // React Router v7 supports more advanced routing features
  // For now, we'll use the basic router configuration
  // In a real app, you might want to handle basename and initialEntries

  console.log('Remote6 App rendered with:', info);

  return (
    <div className="remote6-app">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
