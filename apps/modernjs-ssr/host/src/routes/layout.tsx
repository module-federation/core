import React from 'react';
import { Outlet, Link } from '@modern-js/runtime/router';

const Layout = (): JSX.Element => {
  return (
    <>
      <div>
        <Link to="/remote">remote</Link>
      </div>
      <div>
        <Link to="/nested-remote">nested-remote</Link>
      </div>
      <div>
        <Link to="/dynamic-remote">nested-remote</Link>
      </div>
      <div>
        <Link to="/dynamic-nested-remote">dynamic-nested-remote</Link>
      </div>
      <Outlet />
    </>
  );
};

export default Layout;
