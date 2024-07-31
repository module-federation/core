import './index.css';
import { useRouteLoaderData, Link } from '@modern-js/runtime/router';
import { withMFRouteId } from '@modern-js/runtime/mf';
import Image from '../components/Image';
import type { ProfileData } from './page.data';
import ProviderImage from 'sub-provider/Image';

const Index = (): JSX.Element => {
  console.log('routeId: ', withMFRouteId('page'));
  const data = (useRouteLoaderData(withMFRouteId('page')) as ProfileData) || {
    message: '404',
  };
  return (
    <div className="container-box">
      <Link id="sub-link" to={'a'}>
        {' '}
        jump a
      </Link>
      <p>provider data loader data:</p>
      <p id="sub-data">{data.message}</p>
      <Image />
      <h4>sub self provider</h4>
      <ProviderImage />
    </div>
  );
};
export default Index;
