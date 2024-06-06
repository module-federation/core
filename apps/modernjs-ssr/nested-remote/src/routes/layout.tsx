import { Outlet } from '@modern-js/runtime/router';
import { LiveReload } from '@modern-js/runtime/mf';

export default function Layout() {
  return (
    <div>
      <LiveReload />
      <Outlet />
    </div>
  );
}
