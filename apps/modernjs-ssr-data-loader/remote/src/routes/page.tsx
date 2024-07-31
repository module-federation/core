import Image from '../components/Image';
import './index.css';
import { useRouteLoaderData } from '@modern-js/runtime/router';
import type { ProfileData } from './page.data';
import { withMFRouteId } from '@modern-js/runtime/mf';

const Index = (): JSX.Element => {
  const data = (useRouteLoaderData(withMFRouteId('page')) as ProfileData) || {
    message: '404',
  };
  return (
    <div className="container-box">
      provider {data.message}
      <Image />
    </div>
  );
};
export default Index;
