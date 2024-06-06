import { Image } from 'antd';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  UNSAFE_DataRouterStateContext,
} from 'react-router-dom';
// import "./App.css";

function Home() {
  return <div>hello sub home page</div>;
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

const App = (info?: { abc?: string; test?: number }) => {
  return (
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
  );
};

export default App;
