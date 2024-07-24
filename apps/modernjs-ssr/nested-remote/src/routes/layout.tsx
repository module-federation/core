import { Outlet } from '@modern-js/runtime/router';

export default function Layout() {
  console.log('layout');
  return (
    <div>
      <Outlet />
    </div>
  );
}
