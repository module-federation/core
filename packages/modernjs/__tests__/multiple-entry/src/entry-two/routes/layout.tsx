import { Outlet } from '@modern-js/runtime/router';

export default function Layout() {
  return (
    <div>
      <h2>entry two layout</h2>
      <Outlet />
    </div>
  );
}
