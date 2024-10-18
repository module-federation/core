import { Outlet } from '@modern-js/runtime/router';

export default function Layout() {
  return (
    <div>
      <h2>nested-routes layout</h2>
      <Outlet />
    </div>
  );
}
