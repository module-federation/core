import { Outlet } from '@modern-js/runtime/router';

export default function Layout() {
  return (
    <div>
      <h3>sub layout</h3>
      <Outlet />
    </div>
  );
}
