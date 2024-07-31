import { useRouteLoaderData } from '@modern-js/runtime/router';
import type { ProfileData } from './page.data';
import { withMFRouteId } from '@modern-js/runtime/mf';

const Index = (): JSX.Element => {
  const data = (useRouteLoaderData(withMFRouteId('a/page')) as ProfileData) || {
    message: '404',
  };
  return (
    <div>
      <p>[page/a] data:</p>
      <h5>{data.message}</h5>
    </div>
  );
};

export default Index;
