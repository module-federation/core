import React, { useId, useState } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

function Home({ name, age }: { name?: string; age?: number }) {
  const [count, setCount] = useState(0);
  const fieldId = useId();
  return (
    <div className="react-remote-home">
      <h2>React Remote Home</h2>
      <p className="react-remote-props">
        name: {name}, age: {age}
      </p>
      <label htmlFor={fieldId} className="react-remote-name-label">
        Remote name
      </label>
      <input
        id={fieldId}
        className="react-remote-name-input"
        defaultValue={name}
      />
      <button
        className="react-remote-counter"
        onClick={() => setCount((c) => c + 1)}
      >
        Count: {count}
      </button>
    </div>
  );
}

function Detail() {
  return (
    <div className="react-remote-detail">
      <h2>React Remote Detail</h2>
      <p>SSR detail page content</p>
    </div>
  );
}

export type ReactRemoteProps = {
  name?: string;
  age?: number;
  basename?: string;
};

const ReactRemoteRouteTree = (props: ReactRemoteProps) => {
  return (
    <>
      <nav>
        <Link to="/" className="react-remote-home-link">
          Home
        </Link>
        {' | '}
        <Link to="/detail" className="react-remote-detail-link">
          Detail
        </Link>
      </nav>
      <Routes>
        <Route path="/detail" element={<Detail />} />
        <Route path="/*" element={<Home {...props} />} />
      </Routes>
    </>
  );
};

const App = (props: ReactRemoteProps) => (
  <BrowserRouter>
    <ReactRemoteRouteTree {...props} />
  </BrowserRouter>
);

export default App;
