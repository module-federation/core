import { Outlet } from '@modern-js/runtime/router';
import { SSRLiveReload } from '@modern-js/runtime/mf';

export default function Layout() {
  return (
    <div>
      <SSRLiveReload />
      <Outlet />
    </div>
  );
}
